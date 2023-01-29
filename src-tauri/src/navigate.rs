// Navigation code reference: https://gist.github.com/silvanshade/16df59ab6c3ad61a3825f1b9670cff11

use url::Url;
use tauri::{Window};

pub type BoxError = Box<dyn std::error::Error + Send + Sync + 'static>;
pub type BoxResult<T> = Result<T, BoxError>;


#[cfg(target_os = "windows")]
pub fn webview_navigate(window: &Window, url: Url) -> BoxResult<()> {
    println!("navigating");
    use tauri::window::PlatformWebview;
    use webview2_com::Error::WindowsError;
    use windows::core::HSTRING;
    unsafe fn run(webview: PlatformWebview, url: Url) -> Result<(), wry::Error> {
        let webview = webview.controller().CoreWebView2().map_err(WindowsError)?;
        let url = &HSTRING::from(url.as_str());
        webview.Navigate(url).map_err(WindowsError)?;
        Ok(())
    }
    let (call_tx, call_rx) = oneshot::channel();
    window
        .with_webview(move |webview| unsafe {
            let result = run(webview, url).map_err(Into::into);
            call_tx.send(result).unwrap();
        })
        .map_err(Into::into)
        .and(call_rx.recv().unwrap())
}

