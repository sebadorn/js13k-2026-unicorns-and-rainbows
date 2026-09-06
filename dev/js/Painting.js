import { LevelObject } from './LevelObject.js';
import { normalizeVector } from './MathUtils.js';
import { Renderer } from './Renderer.js';


export class Painting extends LevelObject {


	/** @type {HTMLCanvasElement} */
	canvas;

	/** @type {MagicColor} */
	color;


	/**
	 * 
	 * @param {import('./Level').Level} level
	 * @param {HTMLCanvasElement} canvas
	 * @param {MagicColor} color
	 */
	constructor( level, canvas, color ) {
		super( level, 0, 0, canvas.width, canvas.height );

		this.canvas = canvas;
		this.color = color;

		this.isOnMap = false;
		this.isTower = false;

		this.timerWalking = 0;
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	draw( ctx ) {
		if( !this.isOnMap ) {
			return;
		}

		const rotation = Math.sin( this.timerWalking / 10 ) / 5;
		const center = this.getCenter();
		center.y += this.h / 2;

		Renderer.rotateCenter( ctx, rotation, center );
		ctx.drawImage( this.canvas, this.x, this.y, this.w, this.h );
		Renderer.rotateCenter( ctx, -rotation, center );
	}


	/**
	 * Create a copy that still shares the same level and canvas.
	 * @returns {Painting}
	 */
	shallowCopy() {
		const copy = new Painting( this.level, this.canvas );
		copy.x = this.x;
		copy.y = this.y;
		copy.isOnMap = this.isOnMap;
		copy.isTower = this.isTower;

		return copy;
	}


	/**
	 *
	 * @param {number} dt
	 */
	update( dt ) {
		if( !this.isOnMap ) {
			return;
		}

		if( this.health <= 0 ) {
			return;
		}

		const enemy = this.level.wave?.getClosestEnemy( this );

		// TODO: check if healer and search for healing target instead

		// Walk towards closest enemy or if a healer
		// towards closest friend in need of healing.
		const target = enemy;

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
