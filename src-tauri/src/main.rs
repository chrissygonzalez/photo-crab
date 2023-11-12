// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{CustomMenuItem, Menu, MenuItem, Submenu};
use std::env;
use std::fs;
use chrono::{Utc, Timelike};
use ico;

#[tauri::command]
fn delete_file(path: &str) {
    println!("deleting file with path: {path}");
    fs::remove_file(path);
}

#[tauri::command]
fn check_path(path: &str) -> bool{
    println!("checking if path exists: {path}");
    fs::metadata(path).is_ok()
}

#[tauri::command]
fn rotate_hue(path: &str, path_end: &str, amount: i32) -> String {
    let img = image::open(path).unwrap();
    let new_img = img.huerotate(amount);
    let now = Utc::now().num_seconds_from_midnight();
    let new_path = format!("new_diff_{now}.{path_end}");
    println!("{}", &new_path);
    new_img.save(&new_path).unwrap();
    new_path.to_owned()
}

#[tauri::command]
fn save_ico(path: &str) {
    let mut icon_dir = ico::IconDir::new(ico::ResourceType::Icon);
    println!("path to png is {path}");
    let file = std::fs::File::open(path).unwrap();
    let image = ico::IconImage::read_png(file).unwrap();
    icon_dir.add_entry(ico::IconDirEntry::encode(&image).unwrap());

    let file = std::fs::File::create("new_file.ico").unwrap();
    icon_dir.write(file).unwrap();
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
        .invoke_handler(tauri::generate_handler![rotate_hue, delete_file, check_path, save_ico])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
