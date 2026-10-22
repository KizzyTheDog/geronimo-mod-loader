use std::path::{Path, PathBuf};

const EXE: &str = "Geronimo/Binaries/Win64/Geronimo-Win64-Shipping.exe";

fn steam_path() -> String {
    #[cfg(windows)]
    {
        use winreg::{RegKey, enums::HKEY_CURRENT_USER};
        if let Ok(k) = RegKey::predef(HKEY_CURRENT_USER).open_subkey(r"Software\Valve\Steam") {
            if let Ok(p) = k.get_value::<String, _>("SteamPath") {
                return p.replace('/', "\\");
            }
        }
    }
    r"C:\Program Files (x86)\Steam".into()
}

/// Every `"key"  "value"` pair with the given key in a Valve KeyValues file.
fn vdf_values(text: &str, key: &str) -> Vec<String> {
    text.lines()
        .filter_map(|l| {
            let mut q = l.trim().split('"').filter(|s| !s.trim().is_empty());
            (q.next()? == key).then(|| q.next().map(|v| v.replace("\\\\", "\\")))?
        })
        .collect()
}

#[tauri::command]
fn validate_game(path: String) -> bool {
    Path::new(&path).join(EXE).is_file()
}

#[tauri::command]
fn detect_game() -> Option<String> {
    let steam = steam_path();
    let steamapps = PathBuf::from(&steam).join("steamapps");
    let mut libs = vec![steam];
    if let Ok(t) = std::fs::read_to_string(steamapps.join("libraryfolders.vdf")) {
        libs.extend(vdf_values(&t, "path"));
    }
    libs.iter().find_map(|lib| {
        let apps = PathBuf::from(lib).join("steamapps");
        let acf = std::fs::read_to_string(apps.join("appmanifest_2019620.acf")).ok()?;
        let dir = apps.join("common").join(vdf_values(&acf, "installdir").pop()?);
        let dir = dir.to_string_lossy().into_owned();
        validate_game(dir.clone()).then_some(dir)
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![detect_game, validate_game])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_vdf() {
        let t = "\"libraryfolders\"\n{\n\t\"0\"\n\t{\n\t\t\"path\"\t\t\"D:\\SteamLibrary\"\n\t}\n}";
        assert_eq!(vdf_values(t, "path"), vec![r"D:\SteamLibrary"]);
    }

    #[test]
    fn finds_game_here() {
        println!("detected: {:?}", detect_game());
    }
}
