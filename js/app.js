//Variaveis locais
var scene, camera, renderer;
var debug = false;

init();
animate();


function init() {
	//Criando a cena
	scene = new THREE.Scene();

	//Criando o renderizador
	var WIDTH = window.innerWidth,
		HEIGHT = window.innerHeight;

	renderer = new THREE.WebGLRenderer({antialias:true});
	renderer.setSize(WIDTH, HEIGHT);

	document.body.appendChild(renderer.domElement);

	//Criando a camera
	camera = new THREE.PerspectiveCamera( 75, WIDTH / HEIGHT, 0.1, 1000);
	camera.position.set(0,0,50);
	scene.add(camera);

	//Função para caso a janela seja redimensionada
	window.addEventListener('resize', function() {
	    var WIDTH = window.innerWidth,
	        HEIGHT = window.innerHeight;
    	renderer.setSize(WIDTH, HEIGHT);
    	camera.aspect = WIDTH / HEIGHT;
    	camera.updateProjectionMatrix();
    });

    //Iluminação
    renderer.setClearColor(new THREE.Color( 0xFFFFFF ));
    var light = new THREE.PointLight(0xffffff);
    light.position.set(-100,200,100);
    scene.add(light);

    //criando a bola
	var raio=20, segmentos=32, aneis=10;
	var bolaGeometria = new THREE.SphereBufferGeometry(raio, segmentos, aneis);
	var bolaMaterial = new THREE.MeshBasicMaterial( {color: 0x000000, wireframe: true} );
	var bola = new THREE.Mesh( bolaGeometria, bolaMaterial );
	scene.add(bola);
	bola.rotation.y+=0.5;

	//Controle de orbita com o mouse para
	if(window.location.hash == '#debug') {
		debug = true;
  		orbitCcontrols = new THREE.OrbitControls(camera, renderer.domElement);
	}


	//Controles
	$(document).keydown(function(e) {
	    switch(e.which) {
	        case 37:
	        	bola.rotation.y+=0.5;
	        	bola.position.x+=-0.5;
	        	bola.rotation.y+=0;
	        break;

	        case 38: // up
	        break;

	        case 39:
	        	bola.rotation.y+=0.5;
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