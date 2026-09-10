import { targetFPS } from './Config.js';


/**
 * Timer class to time e.g. animations.
 */
export class Timer {


	/**
	 *
	 * @param {import('./Level').Level} level - Level to which this timer sets its time to.
	 * @param {number} [duration = 0] - Duration in game seconds.
	 */
	constructor( level, duration = 0 ) {
		this.level = level;
		this.set( duration );
	}


	/**
	 *
	 * @returns {boolean}
	 */
	elapsed() {
		return this.level.timer > this.timeEnd;
	}


	/**
	 *
	 * @returns {number}
	 */
	left() {
		return this.timeEnd - this.level.timer;
	}


	/**
	 * 
	 * @returns {number} Progress as [0, 1]
	 */
	progress() {
		return Math.min( 1, 1 - this.left() / this.duration );
	}


	/**
	 * Restart the timer.
	 */
	restart() {
		this.set( this.duration / targetFPS );
	}


	/**
	 * Reset the timer to a new duration.
	 * @param {number} duration - Duration in game seconds.
	 */
	set( duration ) {
		this.duration = duration * targetFPS;
		this.timeEnd = this.level.timer + this.duration;
	}


};
