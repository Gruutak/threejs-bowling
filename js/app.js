$("body").addClass("loading");

//Variaveis locais
var pontos, flagspace = 0;
var count = 0;
var scene, camera, renderer, luz; //Elementos basicos para funcionamento
var bola, pista, pinos = new Array(10); //Objetos
var relogio, discoRelogio, aroRelogio, pivotHoras, pivotMinutos, pivotSegundos; //Objeto relogio
var relogioHora, relogioMinuto, relogioSegundo; //Variáveis do relogio
var jogadas = 0, MAX_JOGADAS = 50;
var caixaCenario;
var porcentagemCarregamento = 0;

var debug = false, lightHelper;
var loadingManager = new THREE.LoadingManager();
var jsonLoader = new THREE.JSONLoader(loadingManager);
var textureLoader = new THREE.TextureLoader(loadingManager);
var stats; //Status do webGL

var flagCarregamento = 3;

$( document ).ready(function(){
	init();
});


function init() {
	console.log("Iniciando aplicação");

	loadingManager.onLoad = function() {
		$("body").removeClass("loading");
		$('body').css('overflow','hidden');

		animate();
	};

	var onProgress = function ( xhr ) {
		if ( xhr.lengthComputable ) {
			porcentagemCarregamento = xhr.loaded / xhr.total * 100
			$('#progresso').text(Math.round(porcentagemCarregamento, 2) + '% carregado');
			$('#progresso').attr('aria-valuenow', Math.round(porcentagemCarregamento, 2));
			$('#progresso').css('width', Math.round(porcentagemCarregamento, 2) + '%');
		}
	};

	//Criando a cena
	scene = new THREE.Scene();

	//Criando o renderizador
	var WIDTH = window.innerWidth,
		HEIGHT = window.innerHeight;

	renderer = new THREE.WebGLRenderer({antialias:true});
	renderer.setSize(WIDTH, HEIGHT);
	renderer.setClearColor( 0x000000 );
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;


	document.body.appendChild(renderer.domElement);


	//Criando a camera
	camera = new THREE.PerspectiveCamera( 100, WIDTH / HEIGHT, 0.1, 1000);
	camera.position.set(0,200,385);
	camera.rotateX( 15 * Math.PI / 180 );
	scene.add(camera);

	//Iluminação
	luz = new THREE.SpotLight( 0xffffff, 2, 3000, 4, 3, 3 );
	luz.position.set(-200,200,-100);
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


	//criando a bola
	var texturasBolas = [
		"bowling_ball_1.jpg",
		"bowling_ball_2.jpg",
		"dark-metal-texture.jpg",
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
		fragmentShader: document.getElementById( 'fragmentShader' ).textContent

	});

	jsonLoader.load(
		"js/models/bowling-ball.json",
		function ( geometry, materials ) {
			bola = new THREE.Mesh( geometry, bolaMaterial );
		    bola.scale.set( 30, 30, 30 );
		    bola.castShadow = true;
		  	scene.add(bola);
			bola.position.set(0, 0, 70);
			bola.rotation.y += 0.5;
			console.log("Modelo da bola carregado");
		},
		onProgress
	);


	//pista
	textureLoader.load( "textures/alley.jpg", function ( texture ) {
		var geometry = new THREE.BoxGeometry( 300, 600, 0);
		var material = new THREE.MeshPhongMaterial({map:texture, side:THREE.DoubleSide});
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
	pivotHoras.rotateZ( 90 * Math.PI / 180 );
	scene.add(pivotHoras);
	pivotMinutos = new THREE.Object3D();
	pivotMinutos.position.set(0, 300, -495);
	pivotMinutos.rotateZ( 40 * Math.PI / 180 );
	scene.add(pivotMinutos);
	pivotSegundos = new THREE.Object3D();
	pivotSegundos.position.set(0, 300, -495);
	pivotSegundos.rotateZ( 0 * Math.PI / 180 );
	scene.add(pivotSegundos);

	//Ponteiros dos relogios
	var ponteiroMaterial = new THREE.LineBasicMaterial( { color: 0x000000 } );
	var ponteiroHoras = new THREE.Mesh( new THREE.CubeGeometry( 40, 2, 0 ), ponteiroMaterial );
	ponteiroHoras.position.set(20,0,0);
	var ponteiroMinutos = new THREE.Mesh( new THREE.CubeGeometry( 45, 2, 0 ), ponteiroMaterial );
	ponteiroMinutos.position.set(22.5,0,0);
	var ponteiroSegundos = new THREE.Mesh( new THREE.CubeGeometry( 50, 1, 0 ), ponteiroMaterial );
	ponteiroSegundos.position.set(25,0,0);
	pivotHoras.add(ponteiroHoras);
	pivotMinutos.add(ponteiroMinutos);
	pivotSegundos.add(ponteiroSegundos);

	//Opções de debug
	if(window.location.hash == '#debug') {
		debug = true;

		var axisHelper = new THREE.AxisHelper( 100 ); //Mostra eixos x, y, z;
		scene.add( axisHelper );

		MAX_JOGADAS = 999;
  		orbitCcontrols = new THREE.OrbitControls(camera, renderer.domElement); //Permite utilizar o mouse para movimentar a camera

  		scene.add( lightHelper );
	}

	//Controles
	$(document).keydown(function(e) {
		    switch(e.which) {
		        case 37:
		        	if(bola.position.x > -125) {
			        	bola.rotation.y -= 0.1;
			        	bola.position.x -= 1;
			        	bola.rotation.y += 0;
		        	}
		        break;

		        case 39:
		        	if(bola.position.x < 125) {
			        	bola.rotation.y += 0.1;
			        	bola.position.x += 1;
			        	bola.rotation.y += 0;
		        	}
		        break;

		        case 32:
		        	if(flagspace == 0){
		        		//curva de bezier
		        		flagspace=1;
						var curve = new THREE.QuadraticBezierCurve3(
							new THREE.Vector3( bola.position.x, bola.position.y, bola.position.z), //ponto inicial
							new THREE.Vector3( THREE.Math.randFloat(-330,330), 0, -270 ), //primeiro ponto medio
							new THREE.Vector3( bola.position.x+0, 0, -500 )   //ponto final
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
		        break;

		        default: return; // exit this handler for other keys
		    }
	    e.preventDefault(); // prevent the default action (scroll / move caret)
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
	bolaMaterial.uniforms[ 'time' ].value = .00025 * ( Date.now() - start );
	bolaMaterial.uniforms[ 'weight' ].value = 0.05 * ( .5 + .5 * Math.sin( .00025 * ( Date.now() - start ) ) );

	stats.begin();
	requestAnimationFrame( animate );
	if(debug){
		orbitCcontrols.update();
		lightHelper.update();
	}
	stats.end();
	renderer.render( scene, camera );
	if(flagspace == 1 && count < 100 && jogadas < MAX_JOGADAS){
		moverbola();
	}
	if(count >= 100){
		flagspace = 0;
		jogadas++;
	}

	// get current time
	var date = new Date;
	relogioSegundo = date.getSeconds();
	relogioMinuto = date.getMinutes();
	relogioHora = date.getHours();

	pivotHoras.rotation.z = -(relogioHora * 2 * Math.PI / 12 - Math.PI/2);
	pivotMinutos.rotation.z = -(relogioMinuto * 2 * Math.PI / 60 - Math.PI/2);
	pivotSegundos.rotation.z = -(relogioSegundo * 2 * Math.PI / 60 - Math.PI/2);
}

function moverbola(){
	bola.position.x = pontos.vertices[count].x;
	bola.position.y = pontos.vertices[count].y;
	bola.position.z = pontos.vertices[count].z;

	if(bola.position.x > 130 || bola.position.x < -130){
		console.log("Canaleta!" + bola.position.x);

		bola.position.x = bola.position.x > 130 ?  134 : -134;

		for(var i = count; i < 100; i++){
			pontos.vertices[i].x = bola.position.x;
		}
	}

	if(bola.position.z <= -390){
		flagspace = 0;
		bola.position.x = 0;
		bola.position.y = 0;
		bola.position.z = 70;
		count = 0;
		jogadas++;
	}
	count++;
	bola.rotation.y += 0.1;
}