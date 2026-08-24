import { Player } from './Player.js';
import { Renderer } from './Renderer.js';


export class Level {


	/**
	 *
	 * @constructor
	 */
	constructor() {
		this.timer = 0;
		this.player = new Player( this, 100, 400 );
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	draw( ctx ) {
		ctx.fillStyle = '#eee';
		ctx.fillRect( 0, 0, Renderer.drawWidth, Renderer.drawHeight );
		const y = 0.7 * Renderer.drawHeight;

		ctx.lineWidth = 4;
		ctx.stokeStyle = '#222';
		ctx.beginPath();
		ctx.moveTo( 0, y );
		ctx.lineTo( Renderer.drawWidth, y );
		ctx.closePath();
		ctx.stroke();

		this.player.draw( ctx );
	}



	/**
	 *
	 * @param {Position} pos
	 */
	onClick( pos ) {
		// TODO: walk player to position
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
