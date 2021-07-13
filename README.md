# CC-Tweaked-Turtle-Controller
Controlling a Turtle From the Minecraft Mod CC: Tweaked using an Electron UI through a websocket connection. Idea inspired by Ottomated.

This idea is fairly easy conceptually, but annoying to implement (especially with little prior knowledge of websockets, electron, threejs, etc.).

If I were to do it again, I wouldn't use javascript (or at least, I'd try to limit my use of it). I'd rather learn TypeScript or something than deal with some of the growing pains of pure js. (While sometimes nice, the weak typing can be very annoying for troubleshooting, for example)

The project is essentially broken into 3 parts.
1. The Websocket Server
2. The Renderer Process
3. The Turtle Client

The websocket server is easy enough to implement. Using the ws module, it's fairly straightforward to do. After establishing a websocket connection and doing a very simple and very un-secure plain-text password check, the server creates a corrosponting turtle object, which is saved into an array. The status of this turtle is checked every 5 seconds with a ping test.

The renderer is electron, combined with threejs, and is easily the most difficult/time-consuming part of the project since I had to learn both, as well as the basics of blender to create a turtle model, which has extended the time it would've took to finish this project by quite a bit. The renderer process sends requests to and recieves data from the main process via electron's ipc.

The turtle client is fairly simple, being made in lua with all the basics of turtle control and websocket management all being provided with the CC:Tweaked mod. The directionality has caused a bit of trouble, since the heading of the turtle is not dynamically calculated (yet), and lua is a language of which I know little about (aside from the fact that, as with javascript and many other languages, the modulo function is not the mathmatical modulo; it's the remainder function. This caused a good few headaches.)

Overall, some things I learned from this project include:
- Class and object utilization
- Event based programming
- Event queueing
- (Some) Promise handling
- Lua
- Websocket connections and servers
- The basics of html requests
- Heartbeats
- Electron
- Inter-Process communication
- ThreeJS
- Creating simple 3D models using primatives
- Creating reflectivity in models
- Creating simple uv maps
