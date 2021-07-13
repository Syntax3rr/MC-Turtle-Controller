class block {
    constructor(t, p) {
        this.data = t;
        this.position = p;
    }
    data;
    position;
};

const EventEmitter = require('events');

class turtle {
    eventBus = new EventEmitter();
    
    name;
    id;
    websocket;
    ready = true;
    connected = true;
    cmdQueue = [];
    mainClass;
    position;
    heading;

    constructor(ws, main) {
        this.name = "test";
        this.id = main.turtles.length;
        this.websocket = ws;
        this.mainClass = main;

        this.#websocketHandler();

        this.cmdQueue.push("getData");

        let superThis = this;
        this.eventBus.once('ready', () => {superThis.mainClass.eventBus.emit('turtleListUpdate');});

        this.cmdQueue.push("moveFwd");
        this.sendCmd();
        this.cmdQueue.push("turnLeft");
        this.cmdQueue.push("moveFwd");
    }

    async #websocketHandler() {
        this.websocket.on('message', (data) => {    
            let decodedData = JSON.parse(data);
            console.log(decodedData)
            switch(decodedData.type) {
                case "pong":
                    this.connected = true;
                    console.log("Recieved pong from " + this.name)
                    break;
                case "readyForIncoming":
                    this.ready = true;
                    this.eventBus.emit('ready');
                    break;
                case "position":
                    this.position = decodedData.pos;
                    this.heading = decodedData.dir;
                    this.mainClass.eventBus.emit('turtleDataUpdate', this);
                    break;
                case "block":
                    var searchForBlockIndex = this.mainClass.world.findIndex(block => (block.position.x == decodedData.pos.x && block.position.y == decodedData.pos.y && block.position.z == decodedData.pos.z))
                    console.log(searchForBlockIndex)
                    if(searchForBlockIndex == -1) {
                        this.mainClass.world.push( new block(decodedData.blockData, {x: decodedData.pos.x, y: decodedData.pos.y, z: decodedData.pos.z}) );
                    } else {
                        this.mainClass.world.splice( searchForBlockIndex, 1, new block(decodedData.blockData, {x: decodedData.pos.x, y: decodedData.pos.y, z: decodedData.pos.z}) );
                    }
                    this.mainClass.eventBus.emit('worldDataUpdate', this);
                    break;
                default:
                    console.log(decodedData.type);
            }
        });
    }

    async sendCmd() {
        console.log("loop1");
        if(!this.ready) await new Promise(resolve => this.eventBus.once('ready', resolve));
        console.log("loop2");
        if(this.cmdQueue.length == 0) await new Promise(resolve => this.eventBus.once('newCmd', resolve));
        console.log("loop3 " + this.cmdQueue[0]);
        this.ready = false;
        this.websocket.send(this.cmdQueue.shift());
        this.sendCmd();
    }
}

exports.block = block;
exports.turtle = turtle;