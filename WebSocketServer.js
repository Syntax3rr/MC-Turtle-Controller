const WebSocket = require('ws');
const Turtle = require('./Objects').turtle;

class Server {
    mainClass;
    wss;

    constructor(main, portNo) {
        this.mainClass = main;
        this.wss = new WebSocket.Server({port: portNo});
        this.#webSocketHandler();
        console.log("Server Initialized On Port: " + portNo);
        this.pinger = setInterval((main) => {
            console.log("pinging")
            for(turtle in main.turtles) {
                turtle.connected = false;
                turtle.websocket.send("ping");
                setTimeout((turtle) => {if(turtle.connected == false) turtle.websocket.terminate()}, 1000);
            }
        }, 5000)
        console.log(this.pinger)
    }

    async #webSocketHandler() {
        this.wss.on('connection', (ws, req) => { //When something connects
            console.log("Client Attempting to Connect");
            if(req.headers.authorization != "simpforshiki") { //Basic Authentication
                ws.send("401: Unauthorized");
                ws.terminate();
                console.log("Client Unauthorized");
                return;
            }
            ws.send('Connection Established');
            console.log("Connection Received");
            this.mainClass.turtles.push(new Turtle(ws, this.mainClass));
        });
    }
}

exports.Server = Server;