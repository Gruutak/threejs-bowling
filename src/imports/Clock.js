import * as THREE from "three";

export default class Clock {
	constructor() {
		this.clock = new THREE.Clock();
		this.clock_disc = new THREE.Mesh(
			new THREE.CircleGeometry(60, 60),
			new THREE.MeshBasicMaterial({ color:0xffffff, side: THREE.DoubleSide })
		);
		this.clock_disc.position.set(0, 300, -495);
		this.clock_border = new THREE.Mesh(
			new THREE.TorusGeometry(60, 5, 10, 100),
			new THREE.MeshBasicMaterial({ color:0x111111 })
		);
		this.clock_border.position.set(0, 300, -495);

		this.createPivots();

		this.createPointers();

	}

	createPivots() {
		this.hours_pivot = new THREE.Object3D();
		this.hours_pivot.position.set(0, 300, -495);
		this.minutes_pivot = new THREE.Object3D();
		this.minutes_pivot.position.set(0, 300, -495);
		this.seconds_pivot = new THREE.Object3D();
		this.seconds_pivot.position.set(0, 300, -495);
	}

	createPointers() {
		const pointer_material = new THREE.LineBasicMaterial( { color: 0x000000 } );
		const pointer_material_seconds = new THREE.LineBasicMaterial( { color: 0xff0000 } );
		const pointer_hours = new THREE.Mesh( new THREE.CubeGeometry( 35, 5, 0 ), pointer_material );
		pointer_hours.position.set(20,0,0);
		const pointer_minutes = new THREE.Mesh( new THREE.CubeGeometry( 45, 4, 0 ), pointer_material );
		pointer_minutes.position.set(22.5,0,0);
		const pointer_seconds = new THREE.Mesh( new THREE.CubeGeometry( 50, 2, 0 ), pointer_material_seconds );
		pointer_seconds.position.set(25,0,0);
		this.hours_pivot.add(pointer_hours);
		this.minutes_pivot.add(pointer_minutes);
		this.seconds_pivot.add(pointer_seconds);
	}

	addToScene(scene) {
		scene.add(this.clock_disc);
		scene.add(this.clock_border);
		scene.add(this.hours_pivot);
		scene.add(this.minutes_pivot);
		scene.add(this.seconds_pivot);
	}

	updateTime() {
		const date = new Date;
		const clock_seconds = date.getSeconds();
		const clock_minutes = date.getMinutes();
		const clock_hours = date.getHours();

		this.hours_pivot.rotation.z = -(clock_hours * 2 * Math.PI / 12 - Math.PI/2);
		this.minutes_pivot.rotation.z = -(clock_minutes * 2 * Math.PI / 60 - Math.PI/2);
		this.seconds_pivot.rotation.z = -(clock_seconds * 2 * Math.PI / 60 - Math.PI/2);
	}
}
