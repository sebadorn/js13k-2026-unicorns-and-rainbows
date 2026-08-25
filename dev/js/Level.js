import { Player } from './Player.js';
import { Renderer } from './Renderer.js';


export class Level {


	/**
	 *
	 * @constructor
	 */
	constructor() {
		this.timer = 0;
		this.player = new Player( this, 100, 0.7 * Renderer.drawHeight - 180 );
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	draw( ctx ) {
		ctx.fillStyle = '#b7eafd';
		ctx.fillRect( 0, 0, Renderer.drawWidth, Renderer.drawHeight );
		const y = 0.7 * Renderer.drawHeight;

		ctx.fillStyle = '#60b369';
		ctx.fillRect( 0, y, Renderer.drawWidth, Renderer.drawHeight - y );

		this.player.draw( ctx );
	}



	/**
	 *
	 * @param {Position} pos
	 */
	onClick( pos ) {
		this.player.walkTo( pos );
	}


	/**
	 *
	 * @param {Position} pos
	 * @returns {boolean}
	 */
	onMouseMove( pos ) {
		let targetFound = false;

		// TODO:

		return targetFound;
	}


	/**
	 *
	 * @param {number} dt
	 */
	update( dt ) {
		this.timer += dt;
		this.player.update( dt );
	}


};
