// IDE State Management
class NeutronIDE {
  constructor() {
    this.editors = new Map();
    this.currentTabId = null;
    this.tabCounter = 0;
    this.monacoEditor = null;
    
    this.init();
  }

  async init() {
    // Initialize Monaco Editor
    await this.initializeMonaco();
    
    // Setup UI event listeners
    this.setupEventListeners();
    
    // Setup IPC event listeners for menu actions
    this.setupIPCListeners();
    
    // Update status message
    this.updateStatusMessage('Neutron IDE ready');
  }

  async initializeMonaco() {
    // Set Monaco Editor theme
    monaco.editor.defineTheme('neutron-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955' },
        { token: 'keyword', foreground: '569CD6' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
      ],
      colors: {
        'editor.background': '#1e1e1e',
        'editor.foreground': '#d4d4d4',
        'editorCursor.foreground': '#d4d4d4',
        'editor.lineHighlightBackground': '#2d2d30',
        'editor.selectionBackground': '#264f78',
        'editor.inactiveSelectionBackground': '#3a3d41'
      }
    });
    
    monaco.editor.setTheme('neutron-dark');
  }

  setupEventListeners() {
    // New tab button
    document.getElementById('newTabBtn').addEventListener('click', () => {
      this.createNewFile();
    });

    // Welcome screen buttons
    document.getElementById('welcomeNewFile').addEventListener('click', () => {
      this.createNewFile();
    });

    document.getElementById('welcomeOpenFile').addEventListener('click', () => {
      this.triggerOpenFile();
    });

    // Sidebar open file button
    document.getElementById('openFileBtn').addEventListener('click', () => {
      this.triggerOpenFile();
    });

    // Sidebar toggle
    document.getElementById('sidebarToggle').addEventListener('click', () => {
      this.toggleSidebar();
    });

    // Handle window resize
    window.addEventListener('resize', () => {
      if (this.monacoEditor) {
        this.monacoEditor.layout();
      }
    });
  }

  setupIPCListeners() {
    // Menu actions
    window.electronAPI.onMenuNewFile(() => {
      this.createNewFile();
    });

    window.electronAPI.onMenuOpenFile((event, fileData) => {
      this.openFile(fileData);
    });

    window.electronAPI.onMenuSaveFile(() => {
      this.saveCurrentFile();
    });

    window.electronAPI.onMenuSaveAsFile(() => {
      this.saveCurrentFileAs();
    });
  }

  createNewFile() {
    const tabId = `tab-${++this.tabCounter}`;
    const fileName = `Untitled-${this.tabCounter}`;
    
    const tabData = {
      id: tabId,
      name: fileName,
      content: '',
      filePath: null,
      modified: false,
      language: 'plaintext'
    };

    this.editors.set(tabId, tabData);
    this.createTab(tabData);
    this.switchToTab(tabId);
    
    // Hide welcome screen if visible
    this.hideWelcomeScreen();
    
    this.updateStatusMessage(`Created new file: ${fileName}`);
  }

  async openFile(fileData) {
    const tabId = `tab-${++this.tabCounter}`;
    
    const tabData = {
      id: tabId,
      name: fileData.name,
      content: fileData.content,
      filePath: fileData.path,
      modified: false,
      language: this.getLanguageFromFileName(fileData.name)
    };

    this.editors.set(tabId, tabData);
    this.createTab(tabData);
    this.switchToTab(tabId);
    
    // Hide welcome screen if visible
    this.hideWelcomeScreen();
    
    this.updateStatusMessage(`Opened file: ${fileData.name}`);
    this.updateFileExplorer();
  }

  createTab(tabData) {
    const tabsContainer = document.getElementById('tabs');
    
    const tab = document.createElement('div');
    tab.className = 'tab';
    tab.id = tabData.id;
    
    const title = document.createElement('span');
    title.className = 'tab-title';
    title.textContent = tabData.name;
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'tab-close';
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeTab(tabData.id);
    });
    
    tab.appendChild(title);
    tab.appendChild(closeBtn);
    
    tab.addEventListener('click', () => {
      this.switchToTab(tabData.id);
    });
    
    tabsContainer.appendChild(tab);
  }

  switchToTab(tabId) {
    // Update active tab
    document.querySelectorAll('.tab').forEach(tab => {
      tab.classList.remove('active');
    });
    
    const activeTab = document.getElementById(tabId);
    if (activeTab) {
      activeTab.classList.add('active');
    }
    
    this.currentTabId = tabId;
    
    // Update editor content
    this.updateEditor();
    
    // Update file info
    const tabData = this.editors.get(tabId);
    if (tabData) {
      this.updateFileInfo(tabData);
    }
  }

  closeTab(tabId) {
    const tabData = this.editors.get(tabId);
    
    // Check if file has unsaved changes
    if (tabData && tabData.modified) {
      // In a real app, you'd show a confirmation dialog here
      const shouldClose = confirm(`${tabData.name} has unsaved changes. Close anyway?`);
      if (!shouldClose) {
        return;
      }
    }
    
    // Remove tab from DOM
    const tab = document.getElementById(tabId);
    if (tab) {
      tab.remove();
    }
    
    // Remove from editors map
    this.editors.delete(tabId);
    
    // Switch to another tab or show welcome screen
    if (this.currentTabId === tabId) {
      const remainingTabs = Array.from(this.editors.keys());
      if (remainingTabs.length > 0) {
        this.switchToTab(remainingTabs[0]);
      } else {
        this.currentTabId = null;
        this.showWelcomeScreen();
      }
    }
    
    this.updateFileExplorer();
  }

  updateEditor() {
    const editorContainer = document.getElementById('editorContainer');
    
    if (!this.currentTabId || !this.editors.has(this.currentTabId)) {
      return;
    }
    
    const tabData = this.editors.get(this.currentTabId);
    
    // Clear existing editor
    editorContainer.innerHTML = '';
    
    // Create Monaco editor
    const editorDiv = document.createElement('div');
    editorDiv.className = 'monaco-editor-container';
    editorContainer.appendChild(editorDiv);
    
    this.monacoEditor = monaco.editor.create(editorDiv, {
      value: tabData.content,
      language: tabData.language,
      theme: 'neutron-dark',
      automaticLayout: true,
      minimap: { enabled: true },
      fontSize: 14,
      lineNumbers: 'on',
      renderWhitespace: 'selection',
      wordWrap: 'on',
      folding: true,
      scrollBeyondLastLine: false
    });
    
    // Listen for content changes
    this.monacoEditor.onDidChangeModelContent(() => {
      tabData.content = this.monacoEditor.getValue();
      this.markTabAsModified(this.currentTabId, true);
      this.updateFileInfo(tabData);
    });
    
    // Listen for cursor position changes
    this.monacoEditor.onDidChangeCursorPosition((e) => {
      this.updateCursorInfo(e.position);
    });
    
    // Focus the editor
    this.monacoEditor.focus();
  }

  markTabAsModified(tabId, modified) {
    const tabData = this.editors.get(tabId);
    if (tabData) {
      tabData.modified = modified;
      
      const tab = document.getElementById(tabId);
      if (tab) {
        if (modified) {
          tab.classList.add('modified');
        } else {
          tab.classList.remove('modified');
        }
      }
    }
  }

  async saveCurrentFile() {
    if (!this.currentTabId) return;
    
    const tabData = this.editors.get(this.currentTabId);
    if (!tabData) return;
    
    if (tabData.filePath) {
      // Save existing file
      const result = await window.electronAPI.writeFile(tabData.filePath, tabData.content);
      if (result.success) {
        this.markTabAsModified(this.currentTabId, false);
        this.updateStatusMessage(`Saved: ${tabData.name}`);
      } else {
        this.updateStatusMessage(`Error saving file: ${result.error}`);
      }
    } else {
      // Save as new file
      this.saveCurrentFileAs();
    }
  }

  async saveCurrentFileAs() {
    if (!this.currentTabId) return;
    
    const tabData = this.editors.get(this.currentTabId);
    if (!tabData) return;
    
    const result = await window.electronAPI.saveFileDialog();
    
    if (!result.canceled && result.filePath) {
      const writeResult = await window.electronAPI.writeFile(result.filePath, tabData.content);
      
      if (writeResult.success) {
        // Update tab data
        tabData.filePath = result.filePath;
        tabData.name = result.filePath.split('/').pop() || result.filePath.split('\\').pop();
        tabData.language = this.getLanguageFromFileName(tabData.name);
        
        // Update tab display
        const tab = document.getElementById(this.currentTabId);
        if (tab) {
          const title = tab.querySelector('.tab-title');
          if (title) {
            title.textContent = tabData.name;
          }
        }
        
        this.markTabAsModified(this.currentTabId, false);
        this.updateStatusMessage(`Saved as: ${tabData.name}`);
        this.updateFileInfo(tabData);
        this.updateFileExplorer();
        
        // Update Monaco editor language if needed
        if (this.monacoEditor) {
          monaco.editor.setModelLanguage(this.monacoEditor.getModel(), tabData.language);
        }
      } else {
        this.updateStatusMessage(`Error saving file: ${writeResult.error}`);
      }
    }
  }

  getLanguageFromFileName(fileName) {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    const languageMap = {
      'js': 'javascript',
      'ts': 'typescript',
      'html': 'html',
      'htm': 'html',
      'css': 'css',
      'scss': 'scss',
      'sass': 'sass',
      'json': 'json',
      'xml': 'xml',
      'md': 'markdown',
      'py': 'python',
      'java': 'java',
      'c': 'c',
      'cpp': 'cpp',
      'cc': 'cpp',
      'cxx': 'cpp',
      'h': 'c',
      'hpp': 'cpp',
      'cs': 'csharp',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'sh': 'shell',
      'bash': 'shell',
      'sql': 'sql',
      'txt': 'plaintext'
    };
    
    return languageMap[extension] || 'plaintext';
  }

  hideWelcomeScreen() {
    const welcomeScreen = document.getElementById('welcomeScreen');
    welcomeScreen.style.display = 'none';
  }

  showWelcomeScreen() {
    const welcomeScreen = document.getElementById('welcomeScreen');
    welcomeScreen.style.display = 'flex';
    
    // Clear editor
    const editorContainer = document.getElementById('editorContainer');
    editorContainer.innerHTML = '';
    editorContainer.appendChild(welcomeScreen);
    
    this.monacoEditor = null;
  }

  updateFileInfo(tabData) {
    const languageSpan = document.getElementById('language');
    const fileSizeSpan = document.getElementById('fileSize');
    
    languageSpan.textContent = this.getLanguageDisplayName(tabData.language);
    fileSizeSpan.textContent = `${tabData.content.length} chars`;
  }

  updateCursorInfo(position) {
    const lineColSpan = document.getElementById('lineCol');
    lineColSpan.textContent = `Ln ${position.lineNumber}, Col ${position.column}`;
  }

  getLanguageDisplayName(language) {
    const displayNames = {
      'javascript': 'JavaScript',
      'typescript': 'TypeScript',
      'html': 'HTML',
      'css': 'CSS',
      'scss': 'SCSS',
      'sass': 'Sass',
      'json': 'JSON',
      'xml': 'XML',
      'markdown': 'Markdown',
      'python': 'Python',
      'java': 'Java',
      'c': 'C',
      'cpp': 'C++',
      'csharp': 'C#',
      'php': 'PHP',
      'ruby': 'Ruby',
      'go': 'Go',
      'rust': 'Rust',
      'shell': 'Shell',
      'sql': 'SQL',
      'plaintext': 'Plain Text'
    };
    
    return displayNames[language] || 'Unknown';
  }

  updateStatusMessage(message) {
    const statusMessage = document.getElementById('statusMessage');
    statusMessage.textContent = message;
    
    // Clear message after 3 seconds
    setTimeout(() => {
      statusMessage.textContent = 'Ready';
    }, 3000);
  }

  updateFileExplorer() {
    const fileExplorer = document.querySelector('.file-explorer');
    
    // Clear existing content
    fileExplorer.innerHTML = '';
    
    if (this.editors.size === 0) {
      // Show no files message
      const noFilesDiv = document.createElement('div');
      noFilesDiv.className = 'no-files-message';
      noFilesDiv.innerHTML = `
        <p>No files open</p>
        <button class="open-file-btn" id="openFileBtn">Open File</button>
      `;
      fileExplorer.appendChild(noFilesDiv);
      
      // Re-attach event listener
      document.getElementById('openFileBtn').addEventListener('click', () => {
        this.triggerOpenFile();
      });
    } else {
      // Show file list
      const fileList = document.createElement('ul');
      fileList.className = 'file-list';
      
      this.editors.forEach((tabData) => {
        const fileItem = document.createElement('li');
        fileItem.className = 'file-item';
        if (tabData.id === this.currentTabId) {
          fileItem.classList.add('active');
        }
        
        fileItem.textContent = tabData.name;
        fileItem.addEventListener('click', () => {
          this.switchToTab(tabData.id);
        });
        
        fileList.appendChild(fileItem);
      });
      
      fileExplorer.appendChild(fileList);
    }
  }

  toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');
    
    // Trigger Monaco editor resize
    setTimeout(() => {
      if (this.monacoEditor) {
        this.monacoEditor.layout();
      }
    }, 300);
  }

  triggerOpenFile() {
    // This will be handled by the main process menu
    // We could implement a file browser here in the future
    this.updateStatusMessage('Use Ctrl+O (Cmd+O) to open a file');
  }
}

// Initialize the IDE when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new NeutronIDE();
});