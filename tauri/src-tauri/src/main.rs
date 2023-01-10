use tauri::{Manager, AppHandle };

#[derive(Clone, serde::Serialize)]
struct Payload {
  message: String,
}

#[cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

#[tauri::command]
fn changeUrl(handle: AppHandle) {
  println!("changing url");
  let login_window = handle.get_window("login").unwrap();
  login_window.open_devtools();
  let thing = login_window.eval("
    return 'hello'
  ");
  println!("{:?}", thing);
}


fn main() {
  tauri::Builder::default()
    .setup(|app| {
      let window = app.get_window("main").unwrap();
      window.open_devtools();
      Ok(())
    })
    .on_page_load(|_wry_window, payload| {
      println!("{}", payload.url());
    })
    .invoke_handler(tauri::generate_handler![changeUrl])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
