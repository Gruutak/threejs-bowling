// Modules
import * as THREE from "three";
import WindowResize from "three-window-resize";
import Stats from "stats.js";
import OrbitControls from "three-orbit-controls";

// Project imports
import Renderer from "./imports/Renderer";
import Camera from "./imports/Camera";
import BowlingSound from "./imports/BowlingSound";
import Light from "./imports/Light";
import Room from "./imports/Room";
import BowlingBall from "./imports/BowlingBall";
import Board from "./imports/Board";
import Clock from "./imports/Clock";
import Alley from "./imports/Alley";

// Styles
require(`./css/main.css`);
require(`./css/normalize.css`);

// Constants
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
let MAX_PLAYS = 10;

// Global variables
let debug = false;
let stats;
let renderer, scene, camera;
let pontos;
let flagspace = false;
let ball/*, ball_material*/;
let lightHelper;
let orbitControls;
const loading_percentage = 0;
const pins = new Array(10);
let count = 0, countAnimacaoPinos = 0;
let canaleta = false;
let clock;
let plays = 0;
let pinsHit = false, resetPins = false;
let bowlingSound;

// Loaders
const loadingManager = new THREE.LoadingManager();
const audioLoader = new THREE.AudioLoader(loadingManager);
const jsonLoader = new THREE.JSONLoader(loadingManager);
const textureLoader = new THREE.TextureLoader(loadingManager);

document.addEventListener(`DOMContentLoaded`, () => {
	init();

	loadingManager.onLoad = function() {
		document.getElementsByTagName(`body`)[0].className += ` loaded`;
		animate();
	};

});


function init() {
	console.log(`Iniciando aplicação`);

	// Checking if it's in debug mode
	if(window.location.hash == `#debug`) {
		debug = true;

		const axisHelper = new THREE.AxisHelper( 100 );
		scene.add( axisHelper );

		MAX_PLAYS = 999;
		orbitControls = new OrbitControls(camera);

		scene.add( lightHelper );
	}

	const onProgress = function ( xhr ) {
		if ( xhr.lengthComputable ) {
			if(debug) {
				console.log(Math.round(loading_percentage, 2) + `% loaded`);
			}
		}
	};

	// Setting up basic stuff
	scene = new THREE.Scene();

	renderer = new Renderer(WIDTH, HEIGHT);
	document.body.appendChild(renderer.domElement);

	camera = new Camera(WIDTH, HEIGHT, scene);
	scene.add(camera);

	const audioListener = new THREE.AudioListener();
	camera.add(audioListener);

	bowlingSound = new BowlingSound(audioListener, audioLoader);
	scene.add(bowlingSound);

	const light = new Light();
	scene.add(light.target);
	scene.add(light);

	lightHelper = new THREE.SpotLightHelper( light );
	//lightHelper.light.target.position = light.target.position;
	//scene.add( new THREE.AmbientLight( 0x444444 ) );
	scene.add(lightHelper);

	// Putting objects into the scene
	const room = new Room(textureLoader, onProgress);
	scene.add(room);

	const commands = new Board(`comandos`, -295, 350, 108, textureLoader, onProgress, `Comandos`, scene); //eslint-disable-line

	const integrantes = new Board(`integrantes`, -295, 141, 108, textureLoader, onProgress, `Integrantes`, scene); //eslint-disable-line
	// scene.add(integrantes);

	const ball_textures = [
		`blue`,
		`fantasy`,
		`lava`
	];
	ball = new BowlingBall(ball_textures[THREE.Math.randInt(0, ball_textures.length-1)], textureLoader, jsonLoader, onProgress);
	scene.add(ball);
	// ball_material = ball.getMaterial;

	const alley = new Alley(textureLoader, onProgress, scene); //eslint-disable-line

	// Not worth creating a class for pins due to performance issues
	jsonLoader.load( `models/bowling-pin.json`, ( geometry, materials ) => {
		const material = materials[1];
		material.morphTargets = true;
		material.color.setHex( 0xff0000 );

		const faceMaterial = new THREE.MultiMaterial( materials );

		for( let i = 0, xpinos1 = -60, xpinos2 = -40, xpinos3 = -20; i < 10; i++) {
			pins[i] = new THREE.Mesh( geometry, faceMaterial );
			pins[i].castShadow = true;
			pins[i].scale.set( 15, 15, 15);

			pins[i].position.y = 41;

			if(i > 5) {
				pins[i].position.z = -450;
				pins[i].position.x = xpinos1;
				xpinos1 += 40;
			}
			else if(i > 2) {
				pins[i].position.z = -420;
				pins[i].position.x = xpinos2;
				xpinos2 += 40;
			}
			else if(i > 0) {
				pins[i].position.z = -390;
				pins[i].position.x = xpinos3;
				xpinos3 += 40;
			}
			else
				pins[i].position.z = -360;

			scene.add(pins[i]);
		}
	}, onProgress);

	clock = new Clock();
	clock.addToScene(scene);


	// Controls
	document.addEventListener(`keydown`, e => {
		switch(e.which) {
		case 37:
			if(ball.position.x > -110) {
				ball.rotateY(3 * Math.PI/180);
				ball.position.x -= 1;
			}
			break;

		case 39:
			if(ball.position.x < 110) {
				ball.rotateY(-3 * Math.PI/180);
				ball.position.x += 1;
			}
			break;

		case 32:
			if(!flagspace) lancarBola();
			break;

		default: return; // exit this handler for other keys
		}
		e.preventDefault(); // prevent the default action (scroll / move caret)
	});

	document.addEventListener(`mousemove`, e => {
		if(!flagspace) {
			//Convertendo coordenadas da tela para coordenadas da cena
			const mouse = {x: 0, y: 0};
			mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
			mouse.y = - (e.clientY / window.innerHeight) * 2 + 1;

			const vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
			vector.unproject( camera );
			const dir = vector.sub( camera.position ).normalize();
			const distance = - camera.position.z / dir.z;
			const pos = camera.position.clone().add( dir.multiplyScalar( distance ) );

			//Movimentando a bola
			if(pos.x < 110 && pos.x > -110) {
				if(pos.x > ball.position.x) ball.rotateY(-3 * Math.PI/180);
				else ball.rotateY(3 * Math.PI/180);

				ball.position.x = pos.x;
			}
			else ball.position.x = pos.x > 0 ? 110 : -110;
		}
	});

	document.addEventListener(`mouseup`, () => {
		if(!flagspace) lancarBola();
	});

	//Objeto para redimensionamento da janela
	const windowResize = new WindowResize(renderer, camera); //eslint-disable-line

	//Objeto para monitoramento do webgl
	stats = new Stats();
	stats.showPanel( 0 );
	document.body.appendChild( stats.dom );
}

// const start = Date.now();

function animate() {
	stats.begin();

	// ball_material.uniforms[ `time` ].value = .00025 * ( Date.now() - start );
	// ball_material.uniforms[ `weight` ].value = 0.01 * ( .5 + .5 * Math.sin( .00025 * ( Date.now() - start ) ) );

	if(debug) {
		orbitControls.update();
		lightHelper.update();
	}

	if(flagspace && count < 100 && plays < MAX_PLAYS) {
		moverbola();
	}

	if(count >= 100) {
		if(pinsHit) {
			if(countAnimacaoPinos < 20) {
				for(let i = 0; i < pins.length; i++) {
					if(pins[i].position.x == 0) pins[i].rotateX(-4.5 * Math.PI / 180);
					else if(pins[i].position.x > 0) {
						pins[i].rotateX(-4.5 * Math.PI / 180);
						pins[i].rotateY(-4.5 * Math.PI / 180);
						pins[i].position.x += 2;
					}
					else if(pins[i].position.x < 0) {
						pins[i].rotateX(-4.5 * Math.PI / 180);
						pins[i].rotateY(4.5 * Math.PI / 180);
						pins[i].position.x -= 2;
					}
					pins[i].position.y -= 1.5;
					pins[i].position.z -= 3;
				}
				countAnimacaoPinos++;
			}
			else {
				pinsHit = false;
				countAnimacaoPinos = 0;
			}
		}
		else {
			if(flagspace) {
				flagspace = false;
				setTimeout(resetJogada, 200);
			}
		}

	}

	clock.updateTime();

	stats.end();
	renderer.render( scene, camera );
	requestAnimationFrame( animate );
}

function moverbola() {
	ball.position.x = pontos.vertices[count].x;
	ball.position.y = pontos.vertices[count].y;
	ball.position.z = pontos.vertices[count].z;

	if((ball.position.x > 110 || ball.position.x < -110) && !canaleta) {
		console.log(`Canaleta!` + ball.position.x);
		canaleta = true;

		let i = 0;

		if(ball.position.x > 110) {
			for(i = 0; i < 10; i++)
				pontos.vertices[count+i].x = 110 + 2*i;

			for(i = count+10; i < 100; i++)
				pontos.vertices[i].x = 130;
		}
		else {
			for(i = 0; i < 10; i++)
				pontos.vertices[count+i].x = -110 - 2*i;

			for(i = count+10; i < 100; i++)
				pontos.vertices[i].x = -130;
		}
	}

	if(ball.position.z <= -360) {
		if(ball.position.x>-110 && ball.position.x < 110) {
			if(!pinsHit) bowlingSound.play();
			pinsHit = true;
			resetPins = true;
		}
	}
	count++;
	ball.rotateY(10 * Math.PI/180);
}

function resetJogada() {
	console.log(`disparando reset`);
	flagspace = false;
	ball.position.set(0,23.5,35);

	for(let i = 0; i < pins.length; i++) {
		pins[i].rotation.x = 0 * Math.PI / 180;
		pins[i].rotation.y = 0 * Math.PI / 180;
		pins[i].rotation.z = 0 * Math.PI / 180;
		pins[i].position.y = 41;
		if(resetPins) {
			if(pins[i].position.x > 0) pins[i].position.x -= 40;
			if(pins[i].position.x < 0) pins[i].position.x += 40;
			pins[i].position.z += 60;
		}
	}

	resetPins = false;
	pinsHit = false;
	count = 0;
	plays++;
	canaleta = false;
}

function lancarBola() {
	//curva de bezier
	flagspace=true;
	const curve = new THREE.QuadraticBezierCurve3(
		new THREE.Vector3( ball.position.x, ball.position.y, ball.position.z), //ponto inicial
		new THREE.Vector3( THREE.Math.randFloat(-330,330), 23.5, -270 ), //primeiro ponto medio
		new THREE.Vector3( ball.position.x+0, 23.5, -500 )   //ponto final
	);

	pontos = new THREE.Geometry();
	pontos.vertices = curve.getPoints(100);

	if(debug) {
		//desenha linha so pra ver caminho da bola
		const material = new THREE.LineBasicMaterial( { color : 0xff0000 } );
		const curveObject = new THREE.Line( pontos, material );
		scene.add(curveObject);
	}
}
