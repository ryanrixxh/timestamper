// Navigation code reference: https://gist.github.com/silvanshade/16df59ab6c3ad61a3825f1b9670cff11

use url::Url;
use tauri::{Window};

pub type BoxError = Box<dyn std::error::Error + Send + Sync + 'static>;
pub type BoxResult<T> = Result<T, BoxError>;


#[cfg(target_os = "windows")]
pub fn webview_navigate(window: &Window, url: Url) -> BoxResult<()> {
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

#[cfg(any(
    target_os = "linux",
    target_os = "dragonfly",
    target_os = "freebsd",
    target_os = "openbsd",
    target_os = "netbsd"
))]
fn webview_navigate(window: &Window, url: Url) -> BoxResult<()> {
    use webkit2gtk::WebViewExt;
    window.with_webview(move |webview| {
        let webview = webview.inner();
        webview.load_uri(url.as_str());
    })?;
    Ok(())
}

#[cfg(target_os = "macos")]
fn webview_navigate(window: &Window, url: Url) -> BoxResult<()> {
    use cacao::{
        foundation::{id, NSString},
        objc::*,
    };
    window
        .with_webview(move |webview| unsafe {
            let webview = webview.inner();
            let string = NSString::new(url.as_str());
            let url: id = msg_send![class!(NSURL), URLWithString: string];
            let request: id = msg_send![class!(NSURLRequest), requestWithURL: url];
            let _navigation: id = msg_send![webview, loadRequest: request];
        })
        .map_err(Into::into)
}
