$("body").addClass("loading");

//Variaveis locais
var scene, camera, renderer; //Elementos basicos para funcionamento
var bola, pista; //Objetos
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
	renderer.setClearColor( 0xffffff );

	document.body.appendChild(renderer.domElement);

	//Criando a camera
	camera = new THREE.PerspectiveCamera( 100, WIDTH / HEIGHT, 0.1, 1000);
	//camera = new THREE.OrthographicCamera( WIDTH / - 2, WIDTH / 2, HEIGHT / 2, HEIGHT / - 2, 0.1, 100000 );
	camera.position.set(0,200,400);
	camera.rotateX( 15 * Math.PI / 180 );
	//camera.up = new THREE.Vector3(0, 15 * Math.Pi / 180, 0);
	//camera.lookAt(new THREE.Vector3(0,0,0));
	scene.add(camera);

	//Função para caso a janela seja redimensionada
	window.addEventListener('resize', function() {
	    var WIDTH = window.innerWidth-60,
	        HEIGHT = window.innerHeight;
    	renderer.setSize(WIDTH, HEIGHT);
    	camera.aspect = WIDTH / HEIGHT;
    	camera.updateProjectionMatrix();
    });

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

	//Controle de orbita com o mouse para
	if(window.location.hash == '#debug') {
		debug = true;
  		orbitCcontrols = new THREE.OrbitControls(camera, renderer.domElement);
	}


	//Controles
	$(document).keydown(function(e) {
	    switch(e.which) {
	        case 37:
	        	bola.rotation.y-=0.1;
	        	bola.position.x+=-0.5;
	        	bola.rotation.y+=0;
	        break;

	        case 38: // up
	        break;

	        case 39:
	        	bola.rotation.y+=0.1;
	        	bola.position.x+=0.5;
	        	bola.rotation.y+=0;
	        break;

	        case 40: // down
	        break;

	        default: return; // exit this handler for other keys
	    }
	    e.preventDefault(); // prevent the default action (scroll / move caret)
	});

}


function animate() {
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
	if(debug)
		orbitCcontrols.update();
}