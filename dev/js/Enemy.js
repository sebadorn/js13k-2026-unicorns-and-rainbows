import { Colors } from './Config.js';
import { LevelObject } from './LevelObject.js';
import { normalizeVector } from './MathUtils.js';
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

		this.timerWalking = 0;
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	draw( ctx ) {
		const rotation = Math.sin( this.timerWalking / 10 ) / 5;
		const center = this.getCenter();
		center.y += this.h / 2;

		Renderer.rotateCenter( ctx, rotation, center );

		ctx.strokeStyle = Colors.White.color;
		ctx.strokeRect( this.x, this.y, this.w, this.h );

		Renderer.rotateCenter( ctx, -rotation, center );
	}


	/**
	 *
	 * @param {number} dt
	 */
	update( dt ) {
		super.update( dt );
		
		if( this.health <= 0 ) {
			return;
		}

		const target = this.level.wave.getClosestPlayerUnit( this );

		if( !target ) {
			return;
		}

		const direction = normalizeVector( {
			x: target.x - this.x,
			y: target.y - this.y,
		} );

		const speed = this.moveSpeed * dt;
		this.x += direction.x * speed;
		this.y += direction.y * speed;

		this.timerWalking = ( direction.x !== 0 || direction.y !== 0 ) ? this.timerWalking + dt : 0;
	}


};
