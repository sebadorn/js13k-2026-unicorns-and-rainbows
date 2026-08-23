export class LevelObject {


	/** @type {import('../Animation').Animation[]} */
	animations = [];


	/**
	 *
	 * @param {import('../Level').Level} level
	 */
	constructor( level ) {
		this.level = level;
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
	update( _dt ) {}


};
