const { app, BrowserWindow, globalShortcut, ipcMain } = require("electron");
const path = require('path');

class GUI {
    mainClass
    win;

    constructor(main) {
        this.mainClass = main;
        
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

    async #createWindow() {
        this.win = new BrowserWindow({
            width: 1280,
            height: 720,
            frame: false,
            webPreferences: {
                preload: path.join(app.getAppPath(), 'Interface/preload.js')
                //nodeIntegration: true,
                //contextIsolation: false
            }
        })
        globalShortcut.register('f5', () => {
            console.log('f5 is pressed');
            this.win.reload();
        });
        this.win.loadFile('Interface/GUInterface.html');
        this.#ipcHandler();
    }

    async #ipcHandler() {
        ipcMain.on('windowEvent', (event, eventType) => {
            switch(eventType) {
                case 'exit':
                    this.win.close()
                    break;
                case 'maximize':
                    this.win.isMaximized() ? this.win.unmaximize() : this.win.maximize();
                    break;
                case 'minimize':
                    this.win.minimize();
                    break;
            }
        })

        let superThis = this;
        function sendTurtleList() {
            let turtleData = [];
            superThis.mainClass.turtles.forEach((turtle) => { turtleData.push({ id: turtle.id, position: turtle.position, dir: turtle.heading }) });
            superThis.win.send('turtleData', turtleData);
        }

        function sendWorldData() {
            superThis.win.send('worldData', superThis.mainClass.world);
        }

        ipcMain.on('dataRequest', (request, requestType) => {
            switch(requestType) {
                case 'turtleData':
                    sendTurtleList(request);
                case 'worldData':
                    sendWorldData(request);
            }
        })

        this.mainClass.eventBus.on('turtleListUpdate', () => {sendTurtleList()});

        this.mainClass.eventBus.on('worldDataUpdate', () => {sendWorldData()});

        this.mainClass.eventBus.on('turtleDataUpdate', (turtle) => {
            this.win.send('turtleUpdate', { id: turtle.id, position: turtle.position, dir: turtle.heading});
        })
    }
}

exports.GUI = GUI;