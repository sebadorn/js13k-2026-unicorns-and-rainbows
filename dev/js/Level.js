export class Level {


	/** @type {import('../Animation').Animation[]} */
	animations = [];


	/**
	 *
	 */
	constructor() {
		this.timer = 0;
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} _ctx
	 * @param {CanvasRenderingContext2D} _ctxUI
	 */
	draw( _ctx, _ctxUI ) {}


	/**
	 *
	 * @param {Position} _pos
	 */
	onClick( _pos ) {}


	/**
	 *
	 * @param {Position} _pos
	 */
	onMouseDrawing( _pos ) {}


	/**
	 * Mouse move event, but only if button:1 is **not** pressed.
	 * If button:1 is pressed, onMouseDrawing is instead called.
	 * @param {Position} _pos
	 * @returns {boolean}
	 */
	onMouseMove( _pos ) {
		return false;
	}


	/**
	 *
	 * @param {number} dt
	 */
	update( dt ) {
		this.timer += dt;
		this.animations.forEach( a => a.do() );
	}


};
