export class LevelObject {


	/** @type {import('../Animation').Animation[]} */
	animations = [];


	/**
	 *
	 * @param {import('./Level').Level} level
	 * @param {number} x
	 * @param {number} y
	 * @param {number} w
	 * @param {number} h
	 */
	constructor( level, x, y, w, h ) {
		this.level = level;
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
	}


	/**
	 *
	 * @returns {number}
	 */
	get centerX() {
		return this.x + this.w / 2;
	}


	/**
	 *
	 * @returns {number}
	 */
	get centerY() {
		return this.y + this.h / 2;
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} _ctx
	 */
	draw( _ctx ) {}


	/**
	 *
	 * @param {number} _dt
	 */
	update( _dt ) {
		this.animations.forEach( a => a.do() );
	}


};
