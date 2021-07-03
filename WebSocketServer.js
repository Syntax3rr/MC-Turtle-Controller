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
        this.pinger = setInterval(() => {
            if(this.mainClass.turtles.length == 0) return;   
            console.log("pinging turtles...");
            this.mainClass.turtles.forEach( (turtle) => {
                turtle.connected = false;
                turtle.cmdQueue.unshift("ping");
                turtle.eventBus.emit('newCmd')
            });
            setTimeout(() => {
                for(let i = 0; i < this.mainClass.turtles.length; i++) {
                    if(this.mainClass.turtles[i].connected == false) {
                        console.log("Disconnected from turtle " + i);
                        this.mainClass.turtles[i].websocket.terminate();
                        this.mainClass.turtles.splice(i, 1);
                        i--;
                        this.mainClass.eventBus.emit('turtleListUpdate');
                    }
                }
            }, 5000);
        }, 10000);      
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