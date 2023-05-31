use tauri::{Manager};
use std::sync::{Arc, Mutex};
use device_query::{DeviceQuery, DeviceEvents, DeviceState};
use open;

#[cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

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

//Shows the timestamps folder in the filesystem
// TODO: Needs error handling and a return of some kind
#[tauri::command]
fn show_in_filesystem(path: &str) {
  open::that(path).unwrap();
}


fn main() {
  tauri::Builder::default()
    .setup(|app| {
      let _window = app.get_window("main").expect("Error while creating main window");
      Ok(())
    })
    .plugin(tauri_plugin_store::Builder::default().build())
    .invoke_handler(tauri::generate_handler![listen_for_keys, show_in_filesystem])
    .build(tauri::generate_context!())
    .expect("error while running tauri application")
    .run(|_app, event| match event { 
      _ => {}
    });
}

