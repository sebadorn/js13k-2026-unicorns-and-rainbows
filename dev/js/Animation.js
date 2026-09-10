import { Timer } from './Timer.js';


export class Animation {


	/**
	 *
	 * @param {Object} options
	 * @param {import('./Level').Level} options.level
	 * @param {number} options.duration - Duration in seconds.
	 * @param {doneCallback?} options.onDone
	 * @param {drawCallback?} options.onDraw
	 * @param {updateCallback?} options.onUpdate
	 */
	constructor( options ) {
		this.timer = new Timer( options.level, options.duration );
		this.onUpdate = options.onUpdate;
		this.onDone = options.onDone;
		this.onDraw = options.onDraw;
	}


	/**
	 * Progress the animation.
	 * @param {number} dt
	 */
	update( dt ) {
		if( !this.timer ) {
			return;
		}

		if( this.timer.elapsed() ) {
			this.onDone?.( this );
			this.timer = null;
		}
		else {
			this.onUpdate?.( this.timer.progress(), dt );
		}
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	draw( ctx ) {
		this.onDraw?.( ctx, this.timer.progress() );
	}


};


/**
 * @callback updateCallback
 * @param {number} progress
 * @param {number} dt
 */

/**
 * @callback drawCallback
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} progress
 */

/**
 * @callback doneCallback
 * @param {Animation} animation
 */
