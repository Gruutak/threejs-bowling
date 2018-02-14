import THREE from "three";

export default class Light {
	constructor() {
		this.luz = new THREE.SpotLight( 0xffffff, 2, 3000, 4.15, 3, 3 );
		this.luz.position.set(-200,200,150);
		this.luz.castShadow = true;
		this.luz.target.position.set(0,0,-500);

		return this.luz;
	}
}
