const WSServer = require('./WebSocketServer')
const UserInterface = require('./UserInterface');
const EventEmitter = require('events');

class Main {
    eventBus = new EventEmitter();
    turtles = [];
    world = [];
    gui;
    server;

    constructor() {
        //Start GUI
        console.log("Starting GUI");
        try {
            this.gui = new UserInterface.GUI(this);
        } catch(err) {
            console.log("GUI Initialization Failed.")
            throw(err);
        }
        console.log("GUI Open")

        // Initialize Server
        console.log("Initializing Server");

        try {
            this.server = new WSServer.Server(this, 8080);
        } catch(err) {
            console.log("Server Initialization Failed.")
            throw(err);
        }
    }
}

var main = new Main();