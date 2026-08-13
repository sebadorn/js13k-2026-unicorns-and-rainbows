'use strict';


js13k.Animation = class {


	/**
	 *
	 * @param {number}   duration - Duration in seconds.
	 * @param {function} onUpdate
	 * @param {function} onDone 
	 */
	constructor( duration, onUpdate, onDone ) {
		this.timer = new js13k.Timer( js13k.Renderer.level, duration );
		this.onUpdate = onUpdate;
		this.onDone = onDone;
	}


	/**
	 *
	 * @param {object?} params
	 */
	do( params ) {
		if( !this.timer ) {
			return;
		}

		if( this.timer.elapsed() ) {
			this.onDone( this );
			this.timer = null;
		}
		else {
			this.onUpdate( this.timer.progress(), params );
		}
	}


};
