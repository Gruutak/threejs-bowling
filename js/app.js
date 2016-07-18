$("body").addClass("loading");

//Variaveis locais
var pontos, flagspace = false;
var count = 0, countAnimacaoPinos = 0;
var scene, camera, renderer, luz; //Elementos basicos para funcionamento
var bola, pivotBola, pista, pinos = new Array(10); //Objetos
var relogio, discoRelogio, aroRelogio, pivotHoras, pivotMinutos, pivotSegundos; //Objeto relogio
var relogioHora, relogioMinuto, relogioSegundo; //Variáveis do relogio
var jogadas = 0, canaleta = false, pinosAtingidos = false, pinosReset = false;
var caixaCenario;
var porcentagemCarregamento = 0;
var audioListener, bowlingSound;

var debug = false, lightHelper;
var loader = new THREE.AudioLoader();
var loadingManager = new THREE.LoadingManager();
var jsonLoader = new THREE.JSONLoader(loadingManager);
var textureLoader = new THREE.TextureLoader(loadingManager);
var stats; //Status do webGL

var flagCarregamento = 3;

$( document ).ready(function(){
	init();

	loadingManager.onLoad = function() {
		$("body").removeClass("loading");
		$('body').css('overflow','hidden');

		animate();
	};

});


function init() {
	console.log("Iniciando aplicação");

	var onProgress = function ( xhr ) {
		if ( xhr.lengthComputable ) {
			if(debug) {
				console.log(Math.round(porcentagemCarregamento, 2) + '% carregado');
			}
		}
	};

	//Criando a cena
	scene = new THREE.Scene();

	//Criando o renderizador
	var WIDTH = window.innerWidth,
		HEIGHT = window.innerHeight;


	renderer = new THREE.WebGLRenderer({antialias:true});
	renderer.setSize(WIDTH, HEIGHT);
	renderer.setClearColor( 0xffffff );
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;


	document.body.appendChild(renderer.domElement);


	//Criando a camera
	camera = new THREE.PerspectiveCamera( 100, WIDTH / HEIGHT, 0.1, 1000);
	camera.position.set(0,200,385);
	camera.rotateX( 15 * Math.PI / 180 );
	scene.add(camera);

	//Som
	audioListener = new THREE.AudioListener();
	camera.add(audioListener);
	bowlingSound = new THREE.Audio(audioListener);
	scene.add(bowlingSound);
	loader.load(
		// resource URL
		'audio/pinos.ogg',
		// Function when resource is loaded
		function ( audioBuffer ) {
			// set the audio object buffer to the loaded object
			bowlingSound.setBuffer( audioBuffer );
		},
		// Function called when download progresses
		function ( xhr ) {
			console.log('Som carregado' );
		}
	);

	//Iluminação
	luz = new THREE.SpotLight( 0xffffff, 2, 3000, 4.15, 3, 3 );
	luz.position.set(-200,200,150);
	luz.castShadow = true;
	luz.target.position.set(0,0,-500);
	lightHelper = new THREE.SpotLightHelper( luz );
	lightHelper.light.target.position = luz.target.position;
	scene.add(luz.target);
	scene.add(luz);
    scene.add( new THREE.AmbientLight( 0x444444 ) );


	//Criando cenário
	var matCaixaCenario = new THREE.MeshPhongMaterial({
		map: textureLoader.load( "textures/concrete.jpg", function(texture) {
		    console.log("Textura do cenário carregada");
		}, onProgress),
		side: THREE.BackSide
	});
	var geoCaixaCenario = new THREE.BoxGeometry( 600, 600, 1000 );
	var caixaCenario = new THREE.Mesh( geoCaixaCenario, matCaixaCenario );
	caixaCenario.position.set(0,290,0);
	caixaCenario.doubleSided = true;
	caixaCenario.receiveShadow = true;
	scene.add(caixaCenario);


	//criando placas
	textureLoader.load( "textures/comandos.jpeg", function ( texture ) {
		texture.magFilter = THREE.NearestFilter;
		texture.minFilter = THREE.NearestFilter;
		var geometry = new THREE.BoxGeometry( 200, 200, 0);
		var material = new THREE.MeshPhongMaterial({map:texture});
		var comandos = new THREE.Mesh( geometry, material );
		comandos.position.set(-295,350,108);
		comandos.rotateY( 270* Math.PI / 180 );
		comandos.receiveShadow = true;
		scene.add(comandos);
		console.log("Placa de comandos carregada");
	}, onProgress);

	textureLoader.load( "textures/integrantes.jpg", function ( texture ) {
		texture.magFilter = THREE.NearestFilter;
		texture.minFilter = THREE.NearestFilter;
		var geometry = new THREE.BoxGeometry( 200, 200, 0);
		var material = new THREE.MeshPhongMaterial({map:texture});
		var integrantes = new THREE.Mesh( geometry, material );
		integrantes.position.set(-295,141,108);
		integrantes.rotateY( 270* Math.PI / 180 );
		integrantes.receiveShadow = true;
		scene.add(integrantes);
		console.log("Placa de integrantes carregada");
	}, onProgress);


	//criando a bola
	var texturasBolas = [
		"blue.jpg",
		"fantasy.jpg",
		"lava.jpg"
	];
	var imagemBola = textureLoader.load( "textures/ball/" + texturasBolas[THREE.Math.randInt(0, texturasBolas.length-1)], function(texture) {
	    console.log("Textura e shader da bola carregados");
	}, onProgress);
	imagemBola.magFilter = THREE.NearestFilter;
	imagemBola.minFilter = THREE.NearestFilter;

	bolaMaterial = new THREE.ShaderMaterial({
		uniforms: {
			tShine: { type: "t", value: imagemBola },
			time: { type: "f", value: 0 },
			weight: { type: "f", value: 0 }
		},
		vertexShader: document.getElementById( 'vertexShader' ).textContent,
		fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
		shading: THREE.SmoothShading
	});

	pivotBola = new THREE.Object3D();
	pivotBola.position.set(0, 23.5, 35);
	pivotBola.rotateX(90 * Math.PI/180);

	jsonLoader.load(
		"js/models/bowling-ball.json",
		function ( geometry, materials ) {
			bola = new THREE.Mesh( geometry, bolaMaterial );
		    bola.scale.set( 30, 30, 30 );
		    bola.rotateX(Math.PI);
		    bola.position.set(0, 70, 0);
		    bola.castShadow = true;
		  	pivotBola.add(bola);
			console.log("Modelo da bola carregado");
		},
		onProgress
	);

	scene.add(pivotBola);


	//pista
	textureLoader.load( "textures/alley.jpg", function ( texture ) {
		var geometry = new THREE.BoxGeometry( 300, 600, 0);
		var material = new THREE.MeshPhongMaterial({map:texture});
		var pista = new THREE.Mesh( geometry, material );
		pista.position.set(0,0,-200);
		pista.rotateX( 90 * Math.PI / 180 );
		pista.receiveShadow = true;
		scene.add(pista);
		console.log("Pista carregada");
	}, onProgress);

	//pinos
	jsonLoader.load( "js/models/bowling-pin.json", function ( geometry, materials ) {
		var material = materials[1];
		material.morphTargets = true;
		material.color.setHex( 0xff0000 );

		var faceMaterial = new THREE.MultiMaterial( materials );

		for( var i = 0, xpinos1 = -60, xpinos2 = -40, xpinos3 = -20; i < 10; i++){
			pinos[i] = new THREE.Mesh( geometry, faceMaterial );
			pinos[i].castShadow = true;
			pinos[i].scale.set( 15, 15, 15);

			pinos[i].position.y = 41;

			if(i > 5) {
				pinos[i].position.z = -450;
				pinos[i].position.x = xpinos1;
				xpinos1 += 40;
			}
			else if(i > 2) {
				pinos[i].position.z = -420;
				pinos[i].position.x = xpinos2;
				xpinos2 += 40;
			}
			else if(i > 0) {
				pinos[i].position.z = -390;
				pinos[i].position.x = xpinos3;
				xpinos3 += 40;
			}
			else
				pinos[i].position.z = -360;

			scene.add(pinos[i]);
		}
	}, onProgress);

	//Relogio
	relogio = new THREE.Clock();
	discoRelogio = new THREE.Mesh(
		new THREE.CircleGeometry(60, 60),
		new THREE.MeshBasicMaterial({ color:0xffffff, side: THREE.DoubleSide })
	);
	discoRelogio.position.set(0, 300, -495);
	scene.add(discoRelogio);
	aroRelogio = new THREE.Mesh(
	  	new THREE.TorusGeometry(60, 5, 10, 100),
	  	new THREE.MeshBasicMaterial({ color:0x111111 })
	);
	aroRelogio.position.set(0, 300, -495);
	scene.add(aroRelogio);


	//Pivots para os ponteiros do relogio
	pivotHoras = new THREE.Object3D();
	pivotHoras.position.set(0, 300, -495);
	scene.add(pivotHoras);
	pivotMinutos = new THREE.Object3D();
	pivotMinutos.position.set(0, 300, -495);
	scene.add(pivotMinutos);
	pivotSegundos = new THREE.Object3D();
	pivotSegundos.position.set(0, 300, -495);
	scene.add(pivotSegundos);

	//Ponteiros dos relogios
	var ponteiroMaterial = new THREE.LineBasicMaterial( { color: 0x000000 } );
	var ponteiroSegundosMaterial = new THREE.LineBasicMaterial( { color: 0xff0000 } );
	var ponteiroHoras = new THREE.Mesh( new THREE.CubeGeometry( 35, 5, 0 ), ponteiroMaterial );
	ponteiroHoras.position.set(20,0,0);
	var ponteiroMinutos = new THREE.Mesh( new THREE.CubeGeometry( 45, 4, 0 ), ponteiroMaterial );
	ponteiroMinutos.position.set(22.5,0,0);
	var ponteiroSegundos = new THREE.Mesh( new THREE.CubeGeometry( 50, 2, 0 ), ponteiroSegundosMaterial );
	ponteiroSegundos.position.set(25,0,0);
	pivotHoras.add(ponteiroHoras);
	pivotMinutos.add(ponteiroMinutos);
	pivotSegundos.add(ponteiroSegundos);

	//Opções de debug
	if(window.location.hash == '#debug') {
		debug = true;

		var axisHelper = new THREE.AxisHelper( 100 ); //Mostra eixos x, y, z;
		scene.add( axisHelper );

  		orbitCcontrols = new THREE.OrbitControls(camera, renderer.domElement); //Permite utilizar o mouse para movimentar a camera

  		scene.add( lightHelper );
	}

	//Controles
	$(document).keydown(function(e) {
		    switch(e.which) {
		        case 37:
		        	if(pivotBola.position.x > -110) {
		        		pivotBola.rotateY(3 * Math.PI/180);
			        	pivotBola.position.x -= 1;
		        	}
		        break;

		        case 39:
		        	if(pivotBola.position.x < 110) {
		        		pivotBola.rotateY(-3 * Math.PI/180);
			        	pivotBola.position.x += 1;
		        	}
		        break;

		        case 32:
		        	if(!flagspace) lancarBola();
		        break;

		        default: return; // exit this handler for other keys
		    }
	    e.preventDefault(); // prevent the default action (scroll / move caret)
	});

	//Movimentando bola com o mouse
	$(document).mousemove(function (e) {
		if(!flagspace) {
			//Convertendo coordenadas da tela para coordenadas da cena
			var mouse = {x: 0, y: 0};
		    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
		    mouse.y = - (e.clientY / window.innerHeight) * 2 + 1;

			var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
			vector.unproject( camera );
			var dir = vector.sub( camera.position ).normalize();
			var distance = - camera.position.z / dir.z;
			var pos = camera.position.clone().add( dir.multiplyScalar( distance ) );

			//Movimentando a bola
			if(pos.x < 110 && pos.x > -110) {
				if(pos.x > pivotBola.position.x) pivotBola.rotateY(-3 * Math.PI/180);
				else pivotBola.rotateY(3 * Math.PI/180);

				pivotBola.position.x = pos.x;
			}
			else pivotBola.position.x = pos.x > 0 ? 110 : -110;
		}
	});

	//Jogando a bola com o clique do mouse
	$(document).mouseup( function() {
		if(!flagspace) lancarBola();
	});

	//Objeto para redimensionamento da janela
	var winResize  = new THREEx.WindowResize(renderer, camera);

	//Objeto para monitoramento do webgl
	stats = new Stats();
	stats.showPanel( 0 );
	document.body.appendChild( stats.dom );
}

var start = Date.now();

function animate() {
	stats.begin();

	bolaMaterial.uniforms[ 'time' ].value = .00025 * ( Date.now() - start );
	bolaMaterial.uniforms[ 'weight' ].value = 0.01 * ( .5 + .5 * Math.sin( .00025 * ( Date.now() - start ) ) );

	if(debug){
		orbitCcontrols.update();
		lightHelper.update();
	}

	if(flagspace && count < 100){
		moverbola();
	}

	if(count >= 100){
		if(pinosAtingidos) {
			if(countAnimacaoPinos < 20) {
				for(var i = 0; i < pinos.length; i++) {
					if(pinos[i].position.x == 0) pinos[i].rotateX(-4.5 * Math.PI / 180);
					else if(pinos[i].position.x > 0) {
						pinos[i].rotateX(-4.5 * Math.PI / 180);
						pinos[i].rotateY(-4.5 * Math.PI / 180);
						pinos[i].position.x += 2;
					}
					else if(pinos[i].position.x < 0) {
						pinos[i].rotateX(-4.5 * Math.PI / 180);
						pinos[i].rotateY(4.5 * Math.PI / 180);
						pinos[i].position.x -= 2;
					}
					pinos[i].position.y -= 1.5;
					pinos[i].position.z -= 3;
				}
				countAnimacaoPinos++;
			}
			else {
				pinosAtingidos = false;
				countAnimacaoPinos = 0;
			}
		}
		else {
			if(flagspace){
				flagspace = false;
				setTimeout(resetJogada, 200);
			}
		}

	}

	// get current time
	var date = new Date;
	relogioSegundo = date.getSeconds();
	relogioMinuto = date.getMinutes();
	relogioHora = date.getHours();

	pivotHoras.rotation.z = -(relogioHora * 2 * Math.PI / 12 - Math.PI/2);
	pivotMinutos.rotation.z = -(relogioMinuto * 2 * Math.PI / 60 - Math.PI/2);
	pivotSegundos.rotation.z = -(relogioSegundo * 2 * Math.PI / 60 - Math.PI/2);

	stats.end();
	renderer.render( scene, camera );
	requestAnimationFrame( animate );
}

function moverbola(){
	pivotBola.position.x = pontos.vertices[count].x;
	pivotBola.position.y = pontos.vertices[count].y;
	pivotBola.position.z = pontos.vertices[count].z;

	if((pivotBola.position.x > 110 || pivotBola.position.x < -110) && !canaleta){
		console.log("Canaleta!" + pivotBola.position.x);
		canaleta = true;

		if(pivotBola.position.x > 110) {
			for(var i = 0; i < 10; i++)
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

	if(pivotBola.position.z <= -360){
		if(pivotBola.position.x>-110 && pivotBola.position.x < 110){
			if(!pinosAtingidos) bowlingSound.play();
			pinosAtingidos = true;
			pinosReset = true;
		}
	}
	count++;
	pivotBola.rotateY(10 * Math.PI/180);
}

function resetJogada(){
	console.log("disparando reset");
	flagspace = false;
	pivotBola.position.set(0,23.5,35);

	for(var i = 0; i < pinos.length; i++) {
		pinos[i].rotation.x = 0 * Math.PI / 180;
		pinos[i].rotation.y = 0 * Math.PI / 180;
		pinos[i].rotation.z = 0 * Math.PI / 180;
		pinos[i].position.y = 41;
		if(pinosReset){
			if(pinos[i].position.x > 0) pinos[i].position.x -= 40;
			if(pinos[i].position.x < 0) pinos[i].position.x += 40;
			pinos[i].position.z += 60;
		}
	}

	pinosReset = false;
	pinosAtingidos = false;
	count = 0;
	jogadas++;
	canaleta = false;
}

function lancarBola() {
	//curva de bezier
	flagspace=true;
	var curve = new THREE.QuadraticBezierCurve3(
		new THREE.Vector3( pivotBola.position.x, pivotBola.position.y, pivotBola.position.z), //ponto inicial
		new THREE.Vector3( THREE.Math.randFloat(-330,330), 23.5, -270 ), //primeiro ponto medio
		new THREE.Vector3( pivotBola.position.x+0, 23.5, -500 )   //ponto final
	);

	pontos = new THREE.Geometry();
	pontos.vertices = curve.getPoints(100);

	if(debug){
		//desenha linha so pra ver caminho da bola
		var material = new THREE.LineBasicMaterial( { color : 0xff0000 } );
		var curveObject = new THREE.Line( pontos, material );
		scene.add(curveObject);
	}
}
