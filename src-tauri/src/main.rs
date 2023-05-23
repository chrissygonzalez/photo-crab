// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{CustomMenuItem, Menu, MenuItem, Submenu};
use std::env;
use std::fs;
use chrono::{Utc, Timelike};

#[tauri::command]
fn delete_file(path: &str) {
    println!("deleting file with path: {path}");
    fs::remove_file(path);
}

#[tauri::command]
fn rotate_hue(path: &str, path_base: &str, path_end: &str, amount: i32) -> String {
    let img = image::open(path).unwrap();
    let new_img = img.huerotate(amount);
    let now = Utc::now().num_seconds_from_midnight();
    let new_path = format!("new_diff_{now}.{path_end}");
    println!("{}", &new_path);
    new_img.save(&new_path).unwrap();
    new_path.to_owned()
}


fn main() {
    println!("In main!");
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let open = CustomMenuItem::new("open".to_string(), "Open Image File");

    let submenu = Submenu::new("File", Menu::new().add_item(open).add_item(quit));
    let menu = Menu::new()
      .add_native_item(MenuItem::Copy)
      .add_item(CustomMenuItem::new("hide", "Hide"))
      .add_submenu(submenu);

    tauri::Builder::default()
        .menu(menu)
        .on_menu_event(|event| match event.menu_item_id() {
            "open" => {
                // get_file_path();
            }
            _ => {}
          })
        .invoke_handler(tauri::generate_handler![rotate_hue, delete_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
