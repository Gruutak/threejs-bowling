import THREE from "three";

export default class BowlingBall {
	constructor(texture, textureLoader, jsonLoader, onProgress) {
		const ball_image = textureLoader.load( `textures/ball/${texture}.jpg`, () => {
			console.log(`Bowling ball texture loaded`);
		}, onProgress);
		ball_image.magFilter = THREE.NearestFilter;
		ball_image.minFilter = THREE.NearestFilter;

		const ball_material = new THREE.ShaderMaterial({
			uniforms: {
				tShine: { type: `t`, value: ball_image },
				time: { type: `f`, value: 0 },
				weight: { type: `f`, value: 0 }
			},
			vertexShader: document.getElementById( `vertexShader` ).textContent,
			fragmentShader: document.getElementById( `fragmentShader` ).textContent,
			shading: THREE.SmoothShading
		});

		this.ball_pivot = new THREE.Object3D();
		this.ball_pivot.position.set(0, 23.5, 35);
		this.ball_pivot.rotateX(90 * Math.PI/180);

		jsonLoader.load(
			`models/bowling-ball.json`,
			geometry => {
				this.ball = new THREE.Mesh( geometry, ball_material );
				this.ball.scale.set( 30, 30, 30 );
				this.ball.rotateX(Math.PI);
				this.ball.position.set(0, 70, 0);
				this.ball.castShadow = true;
				this.ball_pivot.add(this.ball);
				console.log(`Ball model loaded.`);
			},
			onProgress
		);

		return this.ball_pivot;
	}
}
