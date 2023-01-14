use tauri::{Manager, AppHandle, Window};
use url::Url;

mod navigate;

const TWITCH_AUTH_URL: &str = concat!(
  "https://id.twitch.tv/oauth2/authorize?",
  "response_type=token",
  "&client_id=v89m5cded20ey1ppxxsi5ni53c3rv0",
  "&redirect_uri=https://timestamper/logged",
  "&scope=channel%3Amanage%3Abroadcast&state=1"
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


#[tauri::command]
async fn twitch_auth_flow(app: AppHandle) {
  //Build a new window to handle the auth flow
  let window = tauri::WindowBuilder::new(&app, "twitch-auth", tauri::WindowUrl::App("../../index.html".into()))
      //When window navigates, capture url
      .on_navigation(move |url: url::Url| {
        let str = url.as_str();
        //Grab token from return url
        if str.starts_with(TWITCH_REDIRECT_URL) {
          let url_vec = str.split("=").collect::<Vec<&str>>();
          let token = url_vec[1].split("&").collect::<Vec<&str>>()[0];
          println!("Token: {}", token);
        }
        true
      })
      .build()
      .unwrap();
  
  window.hide();
    
  //Navigate to auth url
  let auth = Url::parse(TWITCH_AUTH_URL).unwrap();
  navigate::webview_navigate(&window, auth).unwrap();
}

fn main() {
  tauri::Builder::default()
    .setup(|app| {
      let window = app.get_window("main").unwrap();
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![twitch_auth_flow])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}