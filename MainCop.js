win;
    #createWindow() {
        this.win = new BrowserWindow({
            width: 800,
            height: 600,
            frame: false,
            webPreferences: {
                nodeIntegration: true
            }
        })
        globalShortcut.register('f5', function() {
            console.log('f5 is pressed');
            this.win.reload();
        });
        this.win.loadFile('GUInterface/GUInterface.html');
        this.#ipcHandler()
    }

    #ipcHandler() {
        ipcMain.on("win;exit", () => {this.win.close()});
        ipcMain.on("win;max", () => {this.win.isMaximized() ? this.win.unmaximize() : this.win.maximize();});
        ipcMain.on("win;min", () => {this.win.minimize()});
    }
    
    start() {
        app.on('ready', () => {
            this.#createWindow()
        });
        
        app.on('window-all-closed', () => {
            if( process.platform !== 'darwin') {
                app.quit();
            }
        })
    
        app.on('activate', () => {
            if(BrowserWindow.getAllWindows().length === 0) {
                this.#createWindow();
            }
        })
    }