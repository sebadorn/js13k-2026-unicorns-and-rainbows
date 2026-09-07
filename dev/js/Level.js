export class Level {


	/** @type {import('./PaintingArea').PaintingArea?} */
	paintingArea;

	/** @type {import('./Painting').Painting} */
	unicornPainting;


	/**
	 *
	 */
	constructor() {
		this.isGameOver = false;
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
	 * @param {Position} pos
	 */
	onMouseDrawing( pos ) {
		this.paintingArea?.brushDown( pos );
	}


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
	}


};
