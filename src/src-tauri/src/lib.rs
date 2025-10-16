use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;
use tauri::State;

// Types for IPC communication
#[derive(Debug, Serialize, Deserialize)]
pub struct FileInfo {
    pub id: String,
    pub name: String,
    pub path: String,
    pub file_type: String,
    pub size: Option<u64>,
    pub modified: Option<String>,
    pub is_open: bool,
    pub is_modified: bool,
    pub content: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Workspace {
    pub id: String,
    pub name: String,
    pub path: String,
    pub files: Vec<FileInfo>,
    pub open_files: Vec<String>,
    pub active_file: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Checkpoint {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub timestamp: String,
    pub files: HashMap<String, String>,
    pub metadata: HashMap<String, String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GitStatus {
    pub branch: String,
    pub is_clean: bool,
    pub modified_files: Vec<String>,
    pub staged_files: Vec<String>,
    pub untracked_files: Vec<String>,
    pub ahead: i32,
    pub behind: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AppSettings {
    pub theme: String,
    pub font_size: u32,
    pub font_family: String,
    pub auto_save: bool,
    pub auto_save_delay: u32,
    pub ai_provider: String,
    pub ai_model: String,
    pub git_auto_commit: bool,
    pub checkpoint_auto_create: bool,
}

// App state
pub struct AppState {
    pub workspace: Option<Workspace>,
    pub settings: AppSettings,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            workspace: None,
            settings: AppSettings {
                theme: "dark".to_string(),
                font_size: 14,
                font_family: "JetBrains Mono".to_string(),
                auto_save: true,
                auto_save_delay: 1000,
                ai_provider: "openai".to_string(),
                ai_model: "gpt-4".to_string(),
                git_auto_commit: false,
                checkpoint_auto_create: true,
            },
        }
    }
}

// Tauri commands
#[tauri::command]
async fn get_settings(state: State<'_, AppState>) -> Result<AppSettings, String> {
    Ok(state.settings.clone())
}

#[tauri::command]
async fn set_settings(
    new_settings: AppSettings,
    state: State<'_, AppState>,
) -> Result<(), String> {
    // In a real implementation, you would save these to disk
    println!("Settings updated: {:?}", new_settings);
    Ok(())
}

#[tauri::command]
async fn open_workspace(path: String, state: State<'_, AppState>) -> Result<Workspace, String> {
    let path_buf = PathBuf::from(&path);
    let name = path_buf
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("Unknown")
        .to_string();

    // For now, return a mock workspace
    let workspace = Workspace {
        id: "workspace-1".to_string(),
        name,
        path: path.clone(),
        files: vec![],
        open_files: vec![],
        active_file: None,
    };

    println!("Workspace opened: {}", path);
    Ok(workspace)
}

#[tauri::command]
async fn read_file(path: String) -> Result<String, String> {
    match std::fs::read_to_string(&path) {
        Ok(content) => Ok(content),
        Err(e) => Err(format!("Failed to read file {}: {}", path, e)),
    }
}

#[tauri::command]
async fn write_file(path: String, content: String) -> Result<(), String> {
    match std::fs::write(&path, content) {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to write file {}: {}", path, e)),
    }
}

#[tauri::command]
async fn create_checkpoint(name: String, description: Option<String>) -> Result<Checkpoint, String> {
    let checkpoint = Checkpoint {
        id: format!("checkpoint-{}", chrono::Utc::now().timestamp()),
        name,
        description,
        timestamp: chrono::Utc::now().to_rfc3339(),
        files: HashMap::new(),
        metadata: HashMap::new(),
    };

    println!("Checkpoint created: {:?}", checkpoint);
    Ok(checkpoint)
}

#[tauri::command]
async fn get_git_status() -> Result<GitStatus, String> {
    // Mock git status for now
    let status = GitStatus {
        branch: "main".to_string(),
        is_clean: true,
        modified_files: vec![],
        staged_files: vec![],
        untracked_files: vec![],
        ahead: 0,
        behind: 0,
    };

    Ok(status)
}

#[tauri::command]
async fn ai_generate(prompt: String, context: Option<serde_json::Value>) -> Result<String, String> {
    // Mock AI response for now
    let response = format!("Mock AI response for: {}", prompt);
    println!("AI request: {}", prompt);
    Ok(response)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(AppState::default())
        .invoke_handler(tauri::generate_handler![
            get_settings,
            set_settings,
            open_workspace,
            read_file,
            write_file,
            create_checkpoint,
            get_git_status,
            ai_generate
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
