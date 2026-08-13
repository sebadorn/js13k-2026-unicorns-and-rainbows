'use strict';


js13k.Audio = {


	context: new AudioContext(),


	/**
	 *
	 * @param {Uint8Array} audioData
	 * @param {number?}    volume
	 */
	async play( audioData, volume ) {
		if( audioData instanceof Uint8Array ) {
			const buffer = await this.context.decodeAudioData( audioData.buffer.slice() );

			const gainNode = this.context.createGain();
			gainNode.connect( this.context.destination );
			gainNode.gain.value = volume || 0.5;

			const source = this.context.createBufferSource();
			source.buffer = buffer;
			source.connect( gainNode );
			source.loop = false;
			source.start();
		}
		else {
			audioData[0] = volume || audioData[0];
			zzfx( ...audioData );
		}
	},


};