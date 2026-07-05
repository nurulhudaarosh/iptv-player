use axum::{
    body::Body,
    extract::{Query, State},
    http::{HeaderMap, StatusCode},
    response::{IntoResponse, Response},
    routing::get,
    Router,
};
use portpicker::pick_unused_port;
use serde::Deserialize;
use std::{net::SocketAddr, sync::{Arc, Mutex}};
use tauri::async_runtime;

#[derive(Clone)]
struct AppState {
    proxy_url: Option<String>,
    port: u16,
}

impl AppState {
    fn new() -> Self {
        let port = pick_unused_port().expect("failed to find a free port");
        Self {
            proxy_url: None,
            port,
        }
    }
}

type SharedState = Arc<Mutex<AppState>>;

#[derive(Deserialize)]
struct StreamQuery {
    url: String,
}

async fn stream_handler(
    State(state): State<SharedState>,
    Query(query): Query<StreamQuery>,
) -> impl IntoResponse {
    let proxy_url = {
        let state = state.lock().unwrap();
        state.proxy_url.clone()
    };

    let client_builder = reqwest::Client::builder();
    let client = match proxy_url {
        Some(proxy) => {
            if proxy.is_empty() {
                client_builder.build().unwrap()
            } else {
                let proxy = reqwest::Proxy::all(&proxy).unwrap();
                client_builder.proxy(proxy).build().unwrap()
            }
        }
        None => client_builder.build().unwrap(),
    };

    let res = client.get(&query.url).send().await;

    match res {
        Ok(response) => {
            let mut headers = HeaderMap::new();
            for (key, value) in response.headers().iter() {
                headers.insert(key.clone(), value.clone());
            }

            let stream = response.bytes_stream();
            Response::builder()
                .status(StatusCode::OK)
                .header("Access-Control-Allow-Origin", "*")
                .body(Body::from_stream(stream))
                .unwrap()
        }
        Err(e) => Response::builder()
            .status(StatusCode::INTERNAL_SERVER_ERROR)
            .body(Body::from(format!("Request failed: {}", e)))
            .unwrap(),
    }
}

async fn start_server(state: SharedState) {
    let port = {
        let state = state.lock().unwrap();
        state.port
    };

    let app = Router::new()
        .route("/stream", get(stream_handler))
        .with_state(state);

    let addr = SocketAddr::from(([127, 0, 0, 1], port));
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app.into_make_service())
        .await
        .unwrap();
}

#[tauri::command]
async fn fetch_playlist(url: String, proxy_url: Option<String>) -> Result<String, String> {
    let client_builder = reqwest::Client::builder();

    let client = if let Some(proxy) = proxy_url {
        if proxy.is_empty() {
            client_builder.build().map_err(|e| e.to_string())?
        } else {
            let proxy = reqwest::Proxy::all(proxy).map_err(|e| e.to_string())?;
            client_builder.proxy(proxy).build().map_err(|e| e.to_string())?
        }
    } else {
        client_builder.build().map_err(|e| e.to_string())?
    };

    let response = client.get(&url).send().await.map_err(|e| e.to_string())?;

    if response.status().is_success() {
        response.text().await.map_err(|e| e.to_string())
    } else {
        Err(format!("Request failed with status: {}", response.status()))
    }
}

#[tauri::command]
fn get_server_port(state: tauri::State<SharedState>) -> u16 {
    state.lock().unwrap().port
}

#[tauri::command]
fn set_proxy_url(proxy_url: Option<String>, state: tauri::State<SharedState>) {
    let mut app_state = state.lock().unwrap();
    app_state.proxy_url = proxy_url;
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let state = Arc::new(Mutex::new(AppState::new()));
    let server_state = state.clone();

    tauri::Builder::default()
        .manage(state)
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            fetch_playlist,
            get_server_port,
            set_proxy_url
        ])
        .setup(|_app| {
            async_runtime::spawn(async move {
                start_server(server_state).await;
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
