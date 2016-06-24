$("body").addClass("loading");

//Variaveis locais
var pontos, flagspace = 0;
var count = 0;
var scene, camera, renderer; //Elementos basicos para funcionamento
var xBola = 0;
var bola, pista, pinos = new Array(10); //Objetos
var relogio, discoRelogio, aroRelogio; //Objeto relogio
var jogadas = 0, MAX_JOGADAS = 4;

var debug = false;
var jsonLoader = new THREE.JSONLoader();
var textureLoader = new THREE.TextureLoader();
var stats; //Status do webGL

$( document ).ready(function(){
	$("body").removeClass("loading");
	$('body').css('overflow','hidden');
	init();
	animate();
});


function init() {
	//Criando a cena
	scene = new THREE.Scene();

	//Criando o renderizador
	var WIDTH = window.innerWidth,
		HEIGHT = window.innerHeight;

	renderer = new THREE.WebGLRenderer({antialias:true});
	renderer.setSize(WIDTH, HEIGHT);
	renderer.setClearColor( 0x000000 );

	document.body.appendChild(renderer.domElement);

	//Criando a camera
	camera = new THREE.PerspectiveCamera( 100, WIDTH / HEIGHT, 0.1, 1000);
	//camera = new THREE.OrthographicCamera( WIDTH / - 2, WIDTH / 2, HEIGHT / 2, HEIGHT / - 2, 0.1, 100000 );
	camera.position.set(0,200,400);
	camera.rotateX( 15 * Math.PI / 180 );
	//camera.up = new THREE.Vector3(0, 15 * Math.Pi / 180, 0);
	//camera.lookAt(new THREE.Vector3(0,0,0));
	scene.add(camera);

	//Iluminação
    scene.add( new THREE.AmbientLight( 0xffffff ) );

    //criando a bola
    var texturasBolas = ["textures/bowling_ball_1.jpg", "textures/bowling_ball_2.jpg"];
    textureLoader.load( texturasBolas[THREE.Math.randInt(0, texturasBolas.length-1)], function( texture ) {
        jsonLoader.load( "js/models/bowling-ball.json", function( geometry, materials ){
			var material = new THREE.MeshBasicMaterial( {map:texture, side:THREE.DoubleSide} )
			bola = new THREE.Mesh( geometry, material );
		    bola.scale.set( 30, 30, 30 );
		  	scene.add(bola);
			bola.position.set(0, 0, 70);
			bola.rotation.y += 0.5;
		});

    })

	//pista
	textureLoader.load( "textures/alley.jpg", function ( texture ) {
		var geometry = new THREE.PlaneGeometry( 300, 600, 0);
		var material = new THREE.MeshBasicMaterial({map:texture, side:THREE.DoubleSide});
		var pista = new THREE.Mesh( geometry, material );
		pista.position.set(0,0,-200);
		pista.rotateX( 90 * Math.PI / 180 );
		scene.add(pista);
	});

	//pinos
	jsonLoader.load( "js/models/bowling-pin.json", function ( geometry, materials ) {
		var material = materials[1];
		material.morphTargets = true;
		material.color.setHex( 0xff0000 );

		var faceMaterial = new THREE.MultiMaterial( materials );

		for( var i = 0; i < 10; i++){
			pinos[i] = new THREE.Mesh( geometry, faceMaterial );
			pinos[i].scale.set( 15, 15, 15);

			pinos[i].position.y = 41;

			if(i > 5) {
				pinos[i].position.z = -480;

				switch(i){
					case 6:
						pinos[i].position.x = -60
						break;

					case 7:
						pinos[i].position.x = -20
						break;

					case 8:
						pinos[i].position.x = 20
						break;

					case 9:
						pinos[i].position.x = 60
						break;

				}
			}
			else if(i > 2) {
				pinos[i].position.z = -450;

				switch(i){
					case 3:
						pinos[i].position.x = -40
						break;

					case 4:
						pinos[i].position.x = 0
						break;

					case 5:
						pinos[i].position.x = 40
						break;

				}
			}
			else if(i > 0) {
				pinos[i].position.z = -420;

				switch(i){
					case 1:
						pinos[i].position.x = -20
						break;

					case 2:
						pinos[i].position.x = 20
						break;
				}
			}
			else
				pinos[i].position.z = -390;


			scene.add(pinos[i]);
		}
	});

	//Relogio
	relogio = new THREE.Clock();
	discoRelogio = new THREE.Mesh(
		new THREE.CircleGeometry(60, 60),
		new THREE.MeshBasicMaterial({ color:0x999999, side: THREE.DoubleSide })
	);
	discoRelogio.position.set(0, 300, -500);
	aroRelogio = new THREE.Mesh(
	  	new THREE.TorusGeometry(60, 5, 10, 100),
	  	new THREE.MeshBasicMaterial({ color:0x666666 })
	);
	aroRelogio.position.set(0, 300, -500);
	scene.add(discoRelogio);
	scene.add(aroRelogio);





	//Opções de debug
	if(window.location.hash == '#debug') {
		debug = true;

		//var axisHelper = new THREE.AxisHelper( 100 ); //Mostra eixos x, y, z;
		//scene.add( axisHelper );

  		orbitCcontrols = new THREE.OrbitControls(camera, renderer.domElement); //Permite utilizar o mouse para movimentar a camera

	}

	//Controles
	$(document).keydown(function(e) {
		    switch(e.which) {
		        case 37:
		        	if(bola.position.x > -125) {
			        	bola.rotation.y -= 0.1;
						xBola += -1;
			        	bola.position.x = xBola;
			        	bola.rotation.y += 0;
		        	}
		        break;

		        case 39:
		        	if(bola.position.x < 125) {
			        	bola.rotation.y += 0.1;
			        	xBola += 1;
			        	bola.position.x = xBola;
			        	bola.rotation.y += 0;
		        	}
		        break;

		        case 32:
		        	if(flagspace == 0){
		        		//curva de bezier
		        		flagspace=1;
						var curve = new THREE.QuadraticBezierCurve3(
							new THREE.Vector3( bola.position.x, bola.position.y, bola.position.z), //ponto inicial
							new THREE.Vector3( THREE.Math.randFloat(-450,450), 0, -270 ), //primeiro ponto medio
							new THREE.Vector3( bola.position.x+0, 0, -500 )   //ponto final
						);

						pontos = new THREE.Geometry();
						pontos.vertices = curve.getPoints(100);

						//desenha linha so pra ver caminho da bola
						var material = new THREE.LineBasicMaterial( { color : 0xff0000 } );
						var curveObject = new THREE.Line( pontos, material );
						scene.add(curveObject);
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


function animate() {
	stats.begin();
	requestAnimationFrame( animate );
	if(debug){
		orbitCcontrols.update();
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
}

function moverbola(){
	bola.position.x = pontos.vertices[count].x;
	bola.position.y = pontos.vertices[count].y;
	bola.position.z = pontos.vertices[count].z;

	if(bola.position.x > 150 || bola.position.x < -150){
		console.log("Canaleta!" + bola.position.x);

		bola.position.x = bola.position.x > 150 ?  150 : -150;

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