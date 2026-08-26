import { Level } from '../Level.js';
import { Player } from '../Player.js';
import { Renderer } from '../Renderer.js';
import { Level01 } from './Level01.js';


export class LevelIntro extends Level {


	/**
	 *
	 */
	constructor() {
		super();
		this.player = new Player( this, Renderer.drawWidth * 0.4, 0.4 * Renderer.drawHeight );
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	draw( ctx ) {
		ctx.fillStyle = '#222';
		ctx.fillRect( 0, 0, Renderer.drawWidth, Renderer.drawHeight );
		this.player.draw( ctx );
	}


	/**
	 *
	 * @param {Position} _pos
	 */
	onClick( _pos ) {
		Renderer.changeLevel( new Level01() );
	}


};