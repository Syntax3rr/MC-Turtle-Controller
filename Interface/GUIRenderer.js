import * as THREE from '../node_modules/three/src/Three.js';
import {OrbitControls as OrbitControls} from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from '../node_modules/three/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.physicallyCorrectLights = true;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;


document.body.appendChild(renderer.domElement);

window.addEventListener('resize', () => {
	camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
});

//Controls
const controls = new OrbitControls(camera, renderer.domElement);

//Cameras
camera.position.set(0, 0, 5);

//Draw
var light = new THREE.DirectionalLight(0xffffff, 6, 0);
light.position.x = 10;
light.castShadow = true;
scene.add(light);
scene.add(light.target);

light.angle = Math.PI / 8;
light.shadow.bias = -0.001
light.shadow.camera.far = 20;
/*let size = 2;
light.shadow.camera.top = -size
light.shadow.camera.right = size 
light.shadow.camera.left = -size
light.shadow.camera.bottom = size*/
light.shadow.mapSize.width = 4096;
light.shadow.mapSize.height = 4096;

var lightHelp = new THREE.DirectionalLightHelper(light, 1)
scene.add(lightHelp);
var shadowHelp = new THREE.CameraHelper(light.shadow.camera)
scene.add(shadowHelp);

var ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const boxGeom = new THREE.BoxGeometry()
const standMat = new THREE.MeshPhongMaterial({color: 0x666666})

class Cube extends THREE.Mesh {
	constructor(x, y, z, data) {
		super(boxGeom, standMat);
		this.position.x = x;
		this.position.y = y;
		this.position.z = z;
		this.blockData = data;
		this.castShadow = true;
		this.receiveShadow = true;
		scene.add(this);
	}
}

var world = [];
var turtles = [];
async function getWorld() {
	for (let block of world) {
		block.material.dispose();
		block.geometry.dispose();
		scene.remove(block);
	}
	world = [];
	window.ipc.send('dataRequest', "worldData");
	window.ipc.addListener('worldData', async (data) => {
		console.log("getWorld: ");
		console.log(data);

		data.forEach((block) => {
			console.log(block.data)
			if(block.data == false) {
				world.push({position: block.position, blockData: false });
			} else {
				world.push(new Cube(block.position.x, block.position.y, block.position.z, block.data));
			}
		});
	});
}

async function getTurtles() {
	window.ipc.send('dataRequest', "turtleData");
	window.ipc.addListener('turtleData', async (data) => {
		for (let turtle of turtles) {
			turtle.material.dispose();
			turtle.geometry.dispose();
			scene.remove(turtle);
		}
		turtles = [];
		console.log("getTurtles: ");
		console.log(data)
		for(let obj of data) {
			turtles.push(await loadData(obj));
		}
		if(turtles.length > 0) turtles[0].selected = true;
		changeSelection()
	});
	window.ipc.addListener('turtleUpdate', async (data) => {
		let findTurtle = turtles.find(turtle => turtle.turtleID == data.id)
		console.log(findTurtle);
		if(findTurtle != undefined) {
			findTurtle.rotation.y = (4 - data.dir) * (Math.PI / 2);
			findTurtle.position.set(data.position.x, data.position.y, data.position.z);
		}
	});
}

const loader = new GLTFLoader();

async function loadData(turtleData) {
	let gltf = await new Promise(resolve => {
		loader.load('Assets/Turtle.gltf', resolve)
	})

	let turtle = gltf.scene.getObjectByName('Turtle')
	turtle.turtleID = turtleData.id;
	console.log("loadData: " + turtleData.id + " " + turtle.turtleID);
	turtle.selected = turtle.selected ? true : false;
	turtle.castShadow = true;
	turtle.receiveShadow = true;
	turtle.position.set(turtleData.position.x, turtleData.position.y, turtleData.position.z);
	turtle.rotation.y = (4 - turtleData.dir) * (Math.PI / 2);
	turtle.turtleCamera = new THREE.CubeCamera(0.001, 20, new THREE.WebGLCubeRenderTarget(512)); 
	turtle.turtleCamera.position.set(turtleData.position.x, turtleData.position.y, turtleData.position.z)
	turtle.material.envMap = turtle.turtleCamera.renderTarget.texture;
	scene.add(turtle);
	scene.add(turtle.turtleCamera);
	return turtle;
}

async function changeSelection() {
	console.log(turtles.length)
	turtles.forEach((turtle) => {
		if(turtle.selected == true) {
			camera.position.set(turtle.position.x + 3, turtle.position.y + 2, turtle.position.z + 3);
			camera.lookAt(turtle.position.x, turtle.position.y, turtle.position.z);
			controls.target.set(turtle.position.x, turtle.position.y, turtle.position.z);
		} else {
			turtle.selected = false;
		}
	})
	return;
}


function animate() {
	requestAnimationFrame(animate);
	light.angle = (light.angle % (2 * Math.PI)) + (light.angle > Math.PI ? 0.01 : 0.002);
	light.position.z = (Math.cos(light.angle) * 10) + controls.target.z;
	light.position.y = (Math.sin(light.angle) * 10) + controls.target.y;
	light.position.x = controls.target.x + 10;
	light.target.position.set(controls.target.x, controls.target.y, controls.target.z);
	lightHelp.update();

	turtles.forEach((turtle) => {
		turtle.visible = false;
		turtle.turtleCamera.update(renderer, scene);
		turtle.visible = true;
	})

	renderer.render(scene, camera);
}

getWorld();
getTurtles();
animate();

window.ipc.receive()