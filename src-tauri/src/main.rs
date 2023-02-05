use tauri::{Manager, AppHandle, RunEvent};
use tauri::api::http::{HttpRequestBuilder, ClientBuilder, Body};
use futures::executor::block_on;
use url::Url;
use std::thread::sleep;
use core::time::Duration;
use std::sync::{Arc, RwLock, Mutex};
use lazy_static::lazy_static;
use device_query::{DeviceQuery, DeviceEvents, DeviceState};
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

#[tauri::command]
async fn twitch_auth_flow(app: AppHandle, logged: bool) -> String {
  println!("{}", logged);
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

// Listens for all keypresses and sets a new hotkey when a key is found

#[tauri::command]
fn listen_for_keys() -> String {
  let cancelled = Arc::new(Mutex::new(false));
  let device_state = DeviceState::new();
  let mut hotkey_vec: Vec<String> = Vec::new();
  let util_keys = ["LControl", "LShift", "LAlt", "RControl", "RShift", "RAlt"];
  
  let lock_click = Arc::clone(&cancelled);
  let _guard = device_state.on_mouse_down(move |_button| {
    let mut cancel_writer = lock_click.lock().unwrap();
    *cancel_writer = true;
  });
  
  //TODO: Find a way to set some kind of bool on mouse click
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

//Sends the request to revoke the current access token upon ExitRequested

async fn revoke_token(token: String) {
  let body_string = format!("client_id=v89m5cded20ey1ppxxsi5ni53c3rv0&token={}", token);
  let client = ClientBuilder::new().build().unwrap();
  let body: Body = Body::Text(body_string); //TODO: Woohoo it worked! Maybe clean this up a bit though
  // TODO: Complete this post request.
  let request: HttpRequestBuilder = HttpRequestBuilder::new("POST", "https://id.twitch.tv/oauth2/revoke")
      .unwrap()
      .body(body)
      .header("Content-Type", "application/x-www-form-urlencoded")
      .unwrap();

  if let Ok(_) = client.send(request).await {
    println!("got response");
  } else {
    println!("request bad");
  }

}


fn main() {
  let future = revoke_token(String::from("exampleT0ken"));
  block_on(future);
  tauri::Builder::default()
    .setup(|app| {
      let window = app.get_window("main").unwrap();
      window.open_devtools();
      Ok(())
    })
    .plugin(tauri_plugin_store::Builder::default().build())
    .invoke_handler(tauri::generate_handler![twitch_auth_flow, listen_for_keys])
    .build(tauri::generate_context!())
    .expect("error while running tauri application")
    .run(|_app, event| match event { //TODO: Use this event listener to revoke token when an exit request occurs
      RunEvent::ExitRequested { .. } => {
        println!("{:?}", event);
      }
      _ => {}
    });
}