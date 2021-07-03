const {contextBridge, ipcRenderer} = require("electron");

contextBridge.exposeInMainWorld(
    "ipc", {
        send: (channel, data) => {
            ipcRenderer.send(channel, data);
        },
        receive: (channel, func) => {
            ipcRenderer.once(channel, (event, ...args) => func(...args));
        },
        addListener: (channel, func) => {
            ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
    }
);