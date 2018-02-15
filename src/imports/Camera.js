import * as THREE from "three";

export default class Camera {
	constructor(width, height) {
		this.camera = new THREE.PerspectiveCamera( 100, width / height, 0.1, 1000);
		this.camera.position.set(0,200,385);
		this.camera.rotateX( 15 * Math.PI / 180 );

		return this.camera;
	}
}
