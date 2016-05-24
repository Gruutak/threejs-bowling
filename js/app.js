//criando a cena
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.lookAt(new THREE.Vector3(0,0,0));

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

//criando a bola
var raio=20, segmentos=32, aneis=10;
var bolaGeometria = new THREE.SphereBufferGeometry(raio, segmentos, aneis);
var bolaMaterial = new THREE.MeshBasicMaterial( {color: 0xffffff, wireframe: true} );
var bola = new THREE.Mesh( bolaGeometria, bolaMaterial );
scene.add(bola);

camera.position.z=50;

function render() {
	requestAnimationFrame( render );
	bola.rotation.y+=0.5;
	var time = Date.now() * 0.001;
	renderer.render( scene, camera );
}
render();


//Controles

$(document).keydown(function(e) {
    switch(e.which) {
        case 37:
        	bola.position.x+=-0.5;;
        break;

        case 38: // up
        break;

        case 39:
        	bola.position.x+=0.5;
        break;

        case 40: // down
        break;

        default: return; // exit this handler for other keys
    }
    e.preventDefault(); // prevent the default action (scroll / move caret)
});