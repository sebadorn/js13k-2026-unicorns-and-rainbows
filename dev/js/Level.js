export class Level {


	/**
	 *
	 * @constructor
	 */
	constructor() {
		this.timer = 0;

		/** @type {import('./Animation').Animation[]} */
		this.animations = [];
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	draw( ctx ) {
		this.animations.forEach( anim => anim.do() );
	}


	/**
	 *
	 * @param {number[]} pos - [x, y]
	 */
	onClick( pos ) {
		// TODO:
	}


	/**
	 *
	 * @param {number[]} pos - [x, y]
	 */
	onMouseMove( pos ) {
		// TODO:
	}


	/**
	 *
	 * @param {number} dt
	 */
	update( dt ) {
		this.timer += dt;
	}


};
