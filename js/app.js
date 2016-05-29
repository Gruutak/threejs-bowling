$("body").addClass("loading");

//Variaveis locais
var scene, camera, renderer; //Elementos basicos para funcionamento
var bola, pista, pinos = new Array(10); //Objetos
var debug = false;
var jsonLoader = new THREE.JSONLoader();
var textureLoader = new THREE.TextureLoader();

$( document ).ready(function(){
	$("body").removeClass("loading");
	init();
	animate();
});


function init() {
	//Criando a cena
	scene = new THREE.Scene();
	var axisHelper = new THREE.AxisHelper( 100 );
	scene.add( axisHelper );

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
    var texturasBolas = ["/textures/bowling_ball_1.jpg", "/textures/bowling_ball_2.jpg"];
    textureLoader.load( texturasBolas[Math.floor(Math.random() * texturasBolas.length)], function( texture ) {
        jsonLoader.load( "/js/models/bowling-ball.json", function( geometry, materials ){
			var material = new THREE.MeshBasicMaterial( {map:texture, side:THREE.DoubleSide} )
			bola = new THREE.Mesh( geometry, material );
		    bola.scale.set( 30, 30, 30 );
		  	scene.add(bola);
			bola.position.set(0, 0, 70);
			bola.rotation.y+=0.5;
		});

    })


	//pista
	textureLoader.load( "/textures/alley.jpg", function ( texture ) {
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


	//Controle de orbita com o mouse para
	if(window.location.hash == '#debug') {
		debug = true;
  		orbitCcontrols = new THREE.OrbitControls(camera, renderer.domElement);
	}

	//Controles
	$(document).keydown(function(e) {
		    switch(e.which) {
		        case 37:
		        	if(bola.position.x > -125) {
			        	bola.rotation.y-=0.1;
			        	bola.position.x+=-0.5;
			        	bola.rotation.y+=0;
		        	}
		        break;

		        case 38: // up
		        break;

		        case 39:
		        	if(bola.position.x < 125) {
			        	bola.rotation.y+=0.1;
			        	bola.position.x+=0.5;
			        	bola.rotation.y+=0;
		        	}
		        break;

		        case 40: // down
		        break;

		        default: return; // exit this handler for other keys
		    }
	    e.preventDefault(); // prevent the default action (scroll / move caret)
	});

	//Função para caso a janela seja redimensionada
	window.addEventListener('resize', function() {
	    var WIDTH = window.innerWidth-60,
	        HEIGHT = window.innerHeight;
    	renderer.setSize(WIDTH, HEIGHT);
    	camera.aspect = WIDTH / HEIGHT;
    	camera.updateProjectionMatrix();
    });

}


function animate() {
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
	if(debug)
		orbitCcontrols.update();
}