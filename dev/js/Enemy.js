import { LevelObject } from './LevelObject.js';
import { Colors } from './MagicColors.js';
import { Renderer } from './Renderer.js';


export class Enemy extends LevelObject {


	/** @type {HTMLCanvasElement?} */
	static canvas = null;


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

		this.baseAttackDamage = 5;
		this.baseAttackSpeed = 3;
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {CanvasRenderingContext2D} ctxUI
	 */
	draw( ctx, ctxUI ) {
		super.draw( ctx, ctxUI );

		this.drawEffectTimers( ctx );
		this.drawHealthBar( ctx, Colors.White.color );

		let rotation = 0;
		let center = null;

		if( this.deathTimer ) {
			const progress = this.deathTimer.progress();
			ctx.globalAlpha = 1 - progress;
			rotation = -progress * Math.PI / 2;
			center = this.getCenter();
		}
		else if( this.moveAnimation ) {
			rotation = Math.sin( this.level.timer / 10 ) / 5;
			center = this.getCenter();
			center.y += this.h / 2;
		}

		if( !this.damageTakenTimer.elapsed() ) {
			ctx.globalAlpha = this.damageTakenTimer.progress();
		}

		if( rotation ) {
			Renderer.rotateCenter( ctx, rotation, center );
		}

		if( Enemy.canvas ) {
			ctx.drawImage( Enemy.canvas, this.x, this.y, this.w, this.h );
		}
		else {
			ctx.strokeStyle = Colors.White.color;
			ctx.strokeRect( this.x, this.y, this.w, this.h );
		}

		ctx.globalCompositeOperation = 'multiply';

		if( !this.effects.isSlowed.elapsed() ) {
			ctx.fillStyle = Colors.Cyan.color;
			ctx.fillRect( this.x, this.y, this.w, this.h );
		}

		if(
			!this.effects.isTaunted.elapsed() ||
			!this.effects.isStunned.elapsed()
		) {
			ctx.fillStyle = Colors.Orange.color;
			ctx.fillRect( this.x, this.y, this.w, this.h );
		}

		if( !this.effects.isWeakened.elapsed() ) {
			ctx.fillStyle = Colors.Blue.color;
			ctx.fillRect( this.x, this.y, this.w, this.h );
		}

		ctx.globalCompositeOperation = 'source-over';

		if( rotation ) {
			Renderer.rotateCenter( ctx, -rotation, center );
		}

		ctx.globalAlpha = 1;
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
