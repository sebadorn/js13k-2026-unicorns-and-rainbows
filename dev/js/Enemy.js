import { Colors } from './Config.js';
import { LevelObject } from './LevelObject.js';
import { Renderer } from './Renderer.js';


export class Enemy extends LevelObject {


	/**
	 *
	 * @param {import('./levels/LevelMain').LevelMain} level
	 * @param {number} x
	 * @param {number} y
	 * @param {number} w
	 * @param {number} h
	 */
	constructor( level, x, y, w, h ) {
		super( level, x, y, w, h );

		this.isEnemy = true;
		this.enemyDetectionRange = 300;
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	draw( ctx ) {
		this.drawHealthBar( ctx, Colors.White.color );

		let rotation = 0;
		let center = null;

		if( this.moveAnimation ) {
			rotation = Math.sin( this.level.timer / 10 ) / 5;
			center = this.getCenter();
			center.y += this.h / 2;

			Renderer.rotateCenter( ctx, rotation, center );
		}

		ctx.strokeStyle = Colors.White.color;
		ctx.strokeRect( this.x, this.y, this.w, this.h );

		if( rotation ) {
			Renderer.rotateCenter( ctx, -rotation, center );
		}
	}


	/**
	 *
	 * @param {number} dt
	 */
	update( dt ) {
		super.update( dt );
		this.decideAction();

		if( !this.target ) {
			this.target = this.level.unicornPainting;
			this.move();
		}
	}


};
