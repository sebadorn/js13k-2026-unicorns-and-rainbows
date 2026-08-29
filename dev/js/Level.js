import { PaintingArea } from './PaintingArea.js';
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
	 * @private
	 * @param {CanvasRenderingContext2D} ctx
	 */
	_drawUI( ctx ) {
		// TODO: draw rainbow brush unicorn in bottom left
		// TODO: draw drawing area if in drawing mode

		this.uiOverlay.draw( ctx );
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {CanvasRenderingContext2D} ctxUI
	 */
	draw( ctx, ctxUI ) {
		this._drawMap( ctx );
		this._drawUI( ctxUI );

		if( this.drawingArea ) {
			ctxUI.strokeStyle = '#fff';
			ctxUI.lineWidth = 1;
			ctxUI.strokeRect( this.drawingArea.pos.x, this.drawingArea.pos.y, this.drawingArea.w, this.drawingArea.h );
			this.drawingArea.drawOnParent( ctxUI );
		}
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
	 */
	onMouseDrawing( pos ) {
		if( !this.drawingArea ) {
			this.drawingArea = new PaintingArea( 400, 200, 400, 600 );
		}

		this.drawingArea.color = '#f00';
		this.drawingArea.brushDown( pos );
	}


	/**
	 *
	 * @param {Position} pos
	 * @returns {boolean}
	 */
	onMouseMove( pos ) {
		// TODO: check for clickable element to maybe highlight it

		this.drawingArea?.brushUp();

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
