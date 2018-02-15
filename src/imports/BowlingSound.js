import * as THREE from "three";

export default class BowlingSound {
	constructor(audioListener, loader) {
		this.bowlingSound = new THREE.Audio(audioListener);

		loader.load(
			// resource URL
			`audio/pinos.ogg`,
			// Function when resource is loaded
			audioBuffer => {
				// set the audio object buffer to the loaded object
				this.bowlingSound.setBuffer( audioBuffer );
			},
			// Function called when download progresses
			() => {
				console.log(`Som carregado` );
			}
		);

		return this.bowlingSound;
	}
}
