import { Timer } from './Timer.js';


export class Animation {


	/**
	 *
	 * @param {improt('./Level').Level} level
	 * @param {number}   duration - Duration in seconds.
	 * @param {function} onUpdate
	 * @param {function} onDone 
	 */
	constructor( level, duration, onUpdate, onDone ) {
		this.timer = new Timer( level, duration );
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
