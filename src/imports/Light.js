import * as THREE from "three";

export default class Light {
	constructor() {
		this.light = new THREE.SpotLight( 0xffffff, 2, 3000, 4.15, 3, 3 );
		this.light.position.set(-200,200,150);
		this.light.castShadow = true;
		this.light.target.position.set(0,0,-500);

		return this.light;
	}
}
