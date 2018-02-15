import * as THREE from "three";

export default class Camera {
	constructor(textureLoader, onProgress, scene) {
		textureLoader.load( `textures/alley.jpg`, texture => {
			const geometry = new THREE.BoxGeometry( 300, 600, 0);
			const material = new THREE.MeshPhongMaterial({map:texture});
			this.alley = new THREE.Mesh( geometry, material );
			this.alley.position.set(0,0,-200);
			this.alley.rotateX( 90 * Math.PI / 180 );
			this.alley.receiveShadow = true;
			scene.add(this.alley);
			console.log(`alley carregada`);
		}, onProgress);

		return this.alley;
	}
}
