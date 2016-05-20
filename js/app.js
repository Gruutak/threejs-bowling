var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

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
	var time = Date.now() * 0.001;
	bola.rotation.x+=0.1;
	bola.rotation.y+=0.1;
	renderer.render( scene, camera );
}
render();