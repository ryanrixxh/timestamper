use tauri::{Manager, AppHandle};
use url::Url;
use std::thread::sleep;
use core::time::Duration;
use std::sync::{Arc, RwLock};
use device_query::{DeviceQuery, DeviceEvents, DeviceState};
mod navigate;

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
        return (*read_token.clone()).to_string().into();
      }
    }
    sleep(Duration::from_millis(500));
  }
}

#[tauri::command]
fn listen_for_keys() -> String {
  let device_state = DeviceState::new();
  let mut hotkey_vec: Vec<String> = Vec::new();
  let util_keys = ["LControl", "LShift", "LAlt", "RControl", "RShift", "RAlt"];
  let _guard = device_state.on_mouse_down(move |_button| {}); //TODO: Find a way to set some kind of bool on mouse click
  loop {
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

fn main() {
  tauri::Builder::default()
    .setup(|app| {
      let window = app.get_window("main").unwrap();
      window.open_devtools();
      Ok(())
    })
    .plugin(tauri_plugin_store::Builder::default().build())
    .invoke_handler(tauri::generate_handler![twitch_auth_flow, listen_for_keys])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}