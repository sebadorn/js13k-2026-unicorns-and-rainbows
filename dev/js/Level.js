export class Level {


	/** @type {import('./LevelObject').LevelObject[]} */
	objects = [];


	/**
	 *
	 */
	constructor() {
		this.timer = 0;
	}


	/**
	 *
	 * @private
	 * @param {CanvasRenderingContext2D} ctx
	 */
	_drawMap( ctx ) {
		// TODO: draw background
		this.objects.forEach( o => o.draw( ctx ) );
	}


	/**
	 *
	 * @private
	 * @param {CanvasRenderingContext2D} ctx
	 */
	_drawUI( ctx ) {
		// TODO: draw rainbow brush unicorn in bottom left
		// TODO: draw drawing area if in drawing mode
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {CanvasRenderingContext2D} ctxUI
	 */
	draw( ctx, ctxUI ) {
		this._drawMap( ctx );
		this._drawUI( ctxUI );
	}


	/**
	 *
	 * @param {Position} pos
	 */
	onClick( pos ) {
		// TODO:
	}


	/**
	 *
	 * @param {Position} pos
	 * @returns {boolean}
	 */
	onMouseMove( pos ) {
		// TODO: check for clickable element to maybe highlight it
		return false;
	}


	/**
	 *
	 * @param {number} dt
	 */
	update( dt ) {
		this.timer += dt;
		this.objects.forEach( o => o.update( dt ) );

		// TODO: decide actions for enemy units
		// TODO: decide actions for own units
	}


};
