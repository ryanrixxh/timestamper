use tauri::{Manager, AppHandle, RunEvent};
use tauri::api::http::{HttpRequestBuilder, ClientBuilder, Body, Response};
use tauri::api::Error;
use futures::executor::block_on;
use url::Url;
use std::thread::sleep;
use core::time::Duration;
use std::sync::{Arc, RwLock, Mutex};
use lazy_static::lazy_static;
use device_query::{DeviceQuery, DeviceEvents, DeviceState};
use open;
mod navigate;

lazy_static! {
  static ref TOKEN: Mutex<String> = Mutex::new(String::from(""));
}

const TWITCH_AUTH_URL: &str = concat!(
  "https://id.twitch.tv/oauth2/authorize?",
  "response_type=token",
  "&client_id=v89m5cded20ey1ppxxsi5ni53c3rv0",
  "&redirect_uri=https://timestamper/logged",
  "&scope=channel%3Amanage%3Abroadcast&state=1"
);

const TWITCH_AUTH_URL_FORCE: &str = concat!(
  "https://id.twitch.tv/oauth2/authorize?",
  "response_type=token",
  "&client_id=v89m5cded20ey1ppxxsi5ni53c3rv0",
  "&redirect_uri=https://timestamper/logged",
  "&scope=channel%3Amanage%3Abroadcast&state=1",
  "&force_verify=true",
);

const TWITCH_REDIRECT_URL: &str = "https://timestamper/logged";

#[derive(Clone, serde::Serialize)]
struct Payload {
  message: String,
}

#[cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

//Flow used to authenticating with twitch


//TODO: Failed tauri login needs to be handled without a panic. 
#[tauri::command]
async fn twitch_auth_flow(app: AppHandle, logged: bool) -> String  {
  //Build a new window to handle the auth flow
  let token = Arc::new(RwLock::new("empty".to_string()));
  let token_clone = token.clone();
  let token_read = token.clone();

  let window = tauri::WindowBuilder::new(&app, "twitch-auth", tauri::WindowUrl::App("../../index.html".into()))
      //When window navigates, capture url
      .on_navigation(move |url: url::Url| {
        let str = url.as_str();
        //Grab token from return url
        if str.starts_with(TWITCH_REDIRECT_URL) {
          if let Ok(mut result) = token_clone.write() {
            let url_vec = str.split("=").collect::<Vec<&str>>();
            *result = url_vec[1].split("&").collect::<Vec<&str>>()[0].to_string();
            println!("Token: {}", *result);
          }
        }
        true
      })
      .build()
      .unwrap();

  
  //Navigate to auth url
  let auth;
  if logged == true {
    auth = Url::parse(TWITCH_AUTH_URL).unwrap();
  } else {
    auth = Url::parse(TWITCH_AUTH_URL_FORCE).unwrap();
  }
  
  navigate::webview_navigate(&window, auth).unwrap();
  
  //Wait for recieved token
  loop {
    if let Ok(read_token) = token_read.read() {
      if *read_token != "empty" {
        let _closed = window.close();
        let mut token_guard = TOKEN.lock().unwrap();
        *token_guard = (*read_token.clone()).to_string().into();
        drop(token_guard);
        return (*read_token.clone()).to_string().into();
      }
    }
    sleep(Duration::from_millis(500));
  }
}

//TODO: Failed keywrite needs to be handled without a panic
#[tauri::command]
fn listen_for_keys() -> String {
  let device_state = DeviceState::new();
  let mut hotkey_vec: Vec<String> = Vec::new();
  let util_keys = ["LControl", "LShift", "LAlt", "RControl", "RShift", "RAlt"];
  
  // Sets variable cancelled to true when the mouse is clicked during key listening. 
  // Prevents main thread from hanging.
  let cancelled = Arc::new(Mutex::new(false));
  let lock_click = Arc::clone(&cancelled);
  let _guard = device_state.on_mouse_down(move |_button| {
    let mut cancel_writer = lock_click.lock().unwrap();
    *cancel_writer = true;
  });
  
  let lock_loop = Arc::clone(&cancelled);
  loop {
    let cancel_reader = lock_loop.lock().unwrap();
    if *cancel_reader == true {
      println!("{}", *cancel_reader);
      return String::from("Cancelled");
    }
    let keys = device_state.get_keys();
    if keys.len() > 0 {
      let latest_key = keys[0].to_string();
      let key_str = latest_key.as_str();
      if key_str == "Escape" {
        return String::from("Cancelled")
      }
      if util_keys.contains(&key_str) == false {
        for k in keys.iter() {
          hotkey_vec.push(k.to_string());
        }
        break
      }
    } 
  }

  //Array conversion to string
  let mut hotkey: String = String::from("");
  for i in hotkey_vec.iter().rev() {
    let current = i.as_str();
    match current {
      "LShift" | "RShift" => hotkey.push_str("Shift"),
      "LAlt" | "RAlt" => hotkey.push_str("Alt"),
      "LControl" | "RControl" => hotkey.push_str("CommandOrControl"),
      _ => hotkey.push_str(i),
    }
    hotkey.push('+');
  }
  hotkey.pop();
  return hotkey;
} 

//Sends the request to revoke the current access token
//TODO: Needs to return error if the status on the response is 400
async fn revoke_token(token: String) -> Result<Response, Error> {
  let body_string = format!("client_id=v89m5cded20ey1ppxxsi5ni53c3rv0&token={}", token);
  let client = ClientBuilder::new().build()?;
  let body: Body = Body::Text(body_string); 
  let request = HttpRequestBuilder::new("POST", "https://id.twitch.tv/oauth2/revoke")
      .unwrap()
      .body(body)
      .header("Content-Type", "application/x-www-form-urlencoded")
      .unwrap();

  
  let response = client.send(request).await?; 
  Ok(response)
}

//Shows the timestamps folder in the filesystem
// TODO: Needs error handling and a return of some kind
#[tauri::command]
fn show_in_filesystem(path: &str) {
  open::that(path).unwrap();
}


fn main() {
  tauri::Builder::default()
    .setup(|app| {
      let window = app.get_window("main").expect("Error while creating main window");
      window.open_devtools();
      Ok(())
    })
    .plugin(tauri_plugin_store::Builder::default().build())
    .invoke_handler(tauri::generate_handler![twitch_auth_flow, listen_for_keys, show_in_filesystem])
    .build(tauri::generate_context!())
    .expect("error while running tauri application")
    .run(|_app, event| match event { 
      RunEvent::ExitRequested { .. } => {
        let exit_token_guard = TOKEN.lock().expect("Error grabbing token lock");
        let revoke = revoke_token(exit_token_guard.clone());
        block_on(revoke).expect("Failed to revoke token");
      }
      _ => {}
    });
}

