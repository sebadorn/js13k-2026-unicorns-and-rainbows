import { Level } from '../Level.js';
import { paintingOnMapWidth } from '../Config.js';
import { euclidDistance } from '../MathUtils.js';
import { Renderer } from '../Renderer.js';
import { UIOverlay } from '../UIOverlay.js';


export class LevelMain extends Level {


	/** @type {import('../LevelObject').LevelObject[]} */
	enemies = [];

	/** @type {import('../LevelObject').LevelObject[]} */
	friends = [];


	/**
	 *
	 */
	constructor() {
		super();

		this.isGameOver = false;
		this.uiOverlay = new UIOverlay( this );
	}


	/**
	 *
	 * @private
	 * @param {CanvasRenderingContext2D} ctxUI
	 */
	_drawGameOver( ctxUI ) {
		// TODO: "Game Over" text, e.g. "Darkness consumed all"
		// TODO: button to try again from the beginning of the last wave
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

		if( this.isGameOver ) {
			this._drawGameOver( ctxUI );
			return;
		}

		this.uiOverlay.draw( ctxUI );
	}


	/**
	 *
	 * @param {Position} pos
	 * @returns {import('../LevelObject').LevelObject}
	 */
	getClosestEnemy( pos ) {
		let closestValue = Infinity;
		let closestEnemy = null;

		this.enemies.forEach( enemy => {
			const distance = euclidDistance( enemy, pos );

			if( distance < closestValue ) {
				closestValue = distance;
				closestEnemy = enemy;
			}
		} );

		return closestEnemy;
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
		return this.uiOverlay.onMouseMove( pos );
	}


	/**
	 *
	 * @param {import('../Painting').Painting} painting
	 */
	spawnPainting( painting ) {
		painting.isOnMap = true;
		painting.x = Renderer.drawWidth / 2;
		painting.y = Renderer.drawHeight / 2;

		const scale = paintingOnMapWidth / painting.w;
		painting.w = paintingOnMapWidth;
		painting.h *= scale;

		this.friends.push( painting );
	}


	/**
	 *
	 * @param {number} dt
	 */
	update( dt ) {
		super.update( dt );

		this.enemies.forEach( o => o.update( dt ) );
		this.friends.forEach( o => o.update( dt ) );

		this.uiOverlay.update( dt );
	}


};
