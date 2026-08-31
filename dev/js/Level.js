import { Renderer } from './Renderer.js';
import { UIOverlay } from './UIOverlay.js';


export class Level {


	/** @type {PaintingArea?} */
	drawingArea = null;

	/** @type {import('./LevelObject').LevelObject[]} */
	enemies = [];

	/** @type {import('./LevelObject').LevelObject[]} */
	friends = [];


	/**
	 *
	 */
	constructor() {
		this.timer = 0;
		this.uiOverlay = new UIOverlay( this );
	}


	/**
	 *
	 * @private
	 * @param {CanvasRenderingContext2D} ctx
	 */
	_drawMap( ctx ) {
		ctx.fillStyle = '#111';
		ctx.fillRect( 0, 0, Renderer.drawWidth, Renderer.drawHeight );

		this.friends.forEach( o => o.draw( ctx ) );
		this.enemies.forEach( o => o.draw( ctx ) );
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {CanvasRenderingContext2D} ctxUI
	 */
	draw( ctx, ctxUI ) {
		this._drawMap( ctx );
		this.uiOverlay.draw( ctxUI );
	}


	/**
	 *
	 * @param {Position} pos
	 */
	onClick( pos ) {
		this.uiOverlay.onClick( pos );
	}


	/**
	 *
	 * @param {Position} pos
	 */
	onMouseDrawing( pos ) {
		this.uiOverlay.onMouseDrawing( pos );
	}


	/**
	 * Mouse move event, but only if button:1 is **not** pressed.
	 * If button:1 is pressed, onMouseDrawing is instead called.
	 * @param {Position} pos
	 * @returns {boolean}
	 */
	onMouseMove( pos ) {
		// TODO: check for clickable element to maybe highlight it

		this.uiOverlay.onMouseMove( pos );

		return false;
	}


	/**
	 *
	 * @param {number} dt
	 */
	update( dt ) {
		this.timer += dt;
		this.enemies.forEach( o => o.update( dt ) );
		this.friends.forEach( o => o.update( dt ) );
		this.uiOverlay.update( dt );

		// TODO: decide actions for enemy units
		// TODO: decide actions for own units
	}


};
