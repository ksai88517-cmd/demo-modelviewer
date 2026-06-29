# demo-modelviewer

A lightweight local 3D model viewer built with Three.js. This app lets you open `.glb`, `.gltf`, and `.fbx` files directly in the browser, inspect them with orbit controls, and load `.gltf` projects with their companion assets.

## Features

- Load `.glb`, `.gltf`, and `.fbx` models from your computer
- Drag-and-drop support for quick uploads
- Folder picker for `.gltf` projects with linked assets
- Automatic model framing, scaling, and camera setup
- Orbit controls for rotate, zoom, and pan
- Local vendored Three.js dependencies, so no internet connection is required

## Requirements

- A modern browser such as Chrome, Edge, or Firefox
- Python 3, or another simple local HTTP server

## Clone

```bash
git clone https://github.com/ksai88517-cmd/demo-modelviewer.git
cd demo-modelviewer
```

## Run

### Windows

Double-click `START_SERVER.bat`.

### Manual server

```bash
python -m http.server 8000
```

If your system uses the Python launcher:

```bash
py -3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## How to Use

1. Open the app in a browser through `http://localhost:8000`.
2. Choose a `.glb` or `.fbx` file, or upload a `.gltf` file together with its `.bin` and texture files.
3. For `.gltf` projects that use folder-based assets, use the folder upload option.
4. Use the viewer controls to inspect the model:
   - Drag to rotate
   - Scroll to zoom
   - Right-click to pan

## Project Structure

```text
index.html
script.js
style.css
START_SERVER.bat
vendor/
```

## Notes

- The app should be served over HTTP, not opened with `file://`.
- The local Three.js libraries live in `vendor/`.
- If a `.gltf` model fails to load, make sure the `.bin` and texture files are included and keep the same relative paths.

## Troubleshooting

- If the page is blank, confirm you started a local server and opened `http://localhost:8000`.
- If a model does not appear, verify the file type is supported and that any companion assets are present.
- If you see a loader error, reload the page and try again with a smaller or simpler model first.


