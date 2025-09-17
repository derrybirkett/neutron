# Neutron IDE

A basic but powerful IDE built with Electron and Monaco Editor, providing a modern code editing experience with syntax highlighting, file management, and more.

## Features

- **Monaco Editor Integration**: Full-featured code editor with syntax highlighting for 20+ languages
- **Multi-tab Support**: Open and edit multiple files simultaneously
- **File Operations**: Create, open, save, and manage files with keyboard shortcuts
- **Syntax Highlighting**: Support for JavaScript, TypeScript, Python, HTML, CSS, and many more languages
- **Dark Theme**: Beautiful dark theme optimized for coding
- **Responsive Layout**: Resizable sidebar and responsive design
- **Status Bar**: Real-time information about cursor position, file type, and encoding
- **Cross-platform**: Works on macOS, Windows, and Linux

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Development

To run the application in development mode:

```bash
npm run dev
```

To run the application normally:

```bash
npm start
```

## Keyboard Shortcuts

- **Ctrl+N** (Cmd+N on macOS): Create new file
- **Ctrl+O** (Cmd+O on macOS): Open file
- **Ctrl+S** (Cmd+S on macOS): Save current file
- **Ctrl+Shift+S** (Cmd+Shift+S on macOS): Save as
- **F11**: Toggle fullscreen
- **Ctrl+R** (Cmd+R on macOS): Reload application

## Supported File Types

- JavaScript (.js)
- TypeScript (.ts)
- HTML (.html, .htm)
- CSS (.css)
- SCSS (.scss)
- JSON (.json)
- Python (.py)
- Java (.java)
- C/C++ (.c, .cpp, .h, .hpp)
- C# (.cs)
- PHP (.php)
- Ruby (.rb)
- Go (.go)
- Rust (.rs)
- Shell (.sh, .bash)
- SQL (.sql)
- Markdown (.md)
- And many more...

## Architecture

The application follows Electron's security best practices:

- **Main Process** (`main.js`): Handles window creation, file system operations, and menu management
- **Preload Script** (`preload.js`): Provides secure IPC communication between main and renderer processes  
- **Renderer Process** (`renderer.js`): Manages the IDE interface, Monaco Editor, and user interactions

## Building

To build the application for distribution, you can add build tools like `electron-builder`:

```bash
npm install --save-dev electron-builder
npm run build
```

## License

MIT License