import { Renderer } from './Renderer.js';
import { Timer } from './Timer.js';


export class Animation {


	/**
	 *
	 * @param {number}   duration - Duration in seconds.
	 * @param {function} onUpdate
	 * @param {function} onDone 
	 */
	constructor( duration, onUpdate, onDone ) {
		this.timer = new Timer( Renderer.level, duration );
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
