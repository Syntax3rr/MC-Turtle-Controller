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
	constructor(x, y, z) {
		super(boxGeom, standMat);
		this.position.x = x;
		this.position.y = y;
		this.position.z = z;
		this.castShadow = true;
		this.receiveShadow = true;
		scene.add(this);
	}
}

var world = [];
function getWorld() {
	world.forEach((block) => block.dispose());
	world = [];
	window.ipc.send("dataRequest", "worldData");
	window.ipc.receive("worldData", (data) => {
		console.log(data)
		data.forEach((block) => world.push(new Cube(block.position.x, block.position.y, block.position.z)));
	})
	getTurtles();
}

const loader = new GLTFLoader();

async function loadData(turtleData) {
	let gltf = await new Promise(resolve => {
		loader.load('Assets/Turtle.gltf', resolve)
	})

	let node = gltf.scene.getObjectByName('Turtle')
	node.selected = node.selected ? true : false;
	node.castShadow = true;
	node.receiveShadow = true;
	node.position.set(turtleData.position.x, turtleData.position.y, turtleData.position.z);
	node.rotation.y = turtleData.dir * (Math.PI / 2);
	node.turtleCamera = new THREE.CubeCamera(0.001, 20, new THREE.WebGLCubeRenderTarget(512)); 
	node.turtleCamera.position.set(turtleData.position.x, turtleData.position.y, turtleData.position.z)
	node.material.envMap = node.turtleCamera.renderTarget.texture;
	scene.add(node);
	scene.add(node.turtleCamera);
	return node;
}

var turtles = [];
async function getTurtles() {
	turtles.forEach((turtle) => turtle.dispose());
	turtles = [];
	window.ipc.send("dataRequest", "turtleData");
	window.ipc.receive("turtleData", async (data) => {
		console.log(data)
		for(let obj of data) {
			turtles.push(await loadData(obj));
			if(obj == data[0]) turtles[0].selected = true;
		}
		changeSelection();
		animate();
	});
}

async function changeSelection() {
	turtles.forEach((turt) => {
		if(turt.selected == true) {
			camera.position.set(turt.position.x, turt.position.y, turt.position.z + 5);
			controls.target.set(turt.position.x, turt.position.y, turt.position.z);
		} else {
			turt.selected = false;
		}
	})
}


function animate() {
	requestAnimationFrame(animate);
	light.angle = (light.angle % (2 * Math.PI)) + (light.angle > Math.PI ? 0.01 : 0.002);
	light.position.z = (Math.cos(light.angle) * 10) + controls.target.z;
	light.position.y = (Math.sin(light.angle) * 10) + controls.target.y;
	light.position.x = controls.target.x + 10;
	light.target.position.set(controls.target.x, controls.target.y, controls.target.z);
	lightHelp.update();

	turtles.forEach((turt) => {
		//turt.visible = false;
		turt.turtleCamera.update(renderer, scene);
		//turt.visible = true;
	})

	renderer.render(scene, camera);
}

getWorld();
