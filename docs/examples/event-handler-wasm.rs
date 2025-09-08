// Пример WASM-модуля на Rust
#[no_mangle]
pub extern "C" fn on_post_published(post_json: *const u8, len: usize) {
    let post: Post = parse_json(post_json, len);
    let score = seo_analyze(&post.content);
    
    publish_event("seo.analysis.completed", &json!({
        "post_id": post.id,
        "score": score
    }));
}
