import * as THREE from "three";

export default class Renderer {
	constructor(width, height) {
		this.renderer = new THREE.WebGLRenderer({antialias:true});
		this.renderer.setSize(width, height);
		this.renderer.setClearColor( 0xffffff );
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

		return this.renderer;
	}
}

