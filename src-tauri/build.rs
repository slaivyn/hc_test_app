fn main() {
  println!("cargo:rerun-if-changed=../workdir/my_forum_app.happ");
  tauri_build::build()
}
