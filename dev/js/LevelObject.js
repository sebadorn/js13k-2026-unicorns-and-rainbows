export class LevelObject {


	_needsRedraw = true;


	/**
	 *
	 * @param {import('./Level').Level} level
	 * @param {number} x
	 * @param {number} y
	 */
	constructor( level, x, y ) {
		this.level = level;
		this.x = x;
		this.y = y;
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} _ctx
	 */
	draw( _ctx ) {}


	/**
	 *
	 * @param {number} _timer
	 */
	update( _timer ) {}


};
