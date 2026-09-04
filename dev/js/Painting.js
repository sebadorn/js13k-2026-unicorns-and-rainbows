import { LevelObject } from './LevelObject.js';
import { normalizeVector } from './MathUtils.js';
import { Renderer } from './Renderer.js';


export class Painting extends LevelObject {


	/** @type {HTMLCanvasElement} */
	canvas;


	/**
	 * 
	 * @param {import('./Level.js').Level} level
	 * @param {HTMLCanvasElement} canvas
	 */
	constructor( level, canvas ) {
		super( level, 0, 0, canvas.width, canvas.height );
		this.canvas = canvas;

		this.galleryHitBox = {
			x: 0,
			y: 0,
			w: this.w,
			h: this.h,
		};

		this.isOnMap = false;
		this.timerWalking = false;
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

		copy.galleryHitBox.x = this.galleryHitBox.x;
		copy.galleryHitBox.y = this.galleryHitBox.y;
		copy.galleryHitBox.w = this.galleryHitBox.w;
		copy.galleryHitBox.h = this.galleryHitBox.h;

		copy.isOnMap = this.isOnMap;

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

		const enemy = this.level.getClosestEnemy( this );

		// Either walk towards closest enemy or otherwise
		// the top right corner (enemy spawn point)
		const target = enemy || { x: Renderer.drawWidth, y: 0 };

		const direction = normalizeVector( {
			x: target.x - this.x,
			y: target.y - this.y,
		} );

		const speed = 0.5 * dt;
		this.x += direction.x * speed;
		this.y += direction.y * speed;

		this.timerWalking = ( direction.x !== 0 || direction.y !== 0 ) ? this.timerWalking + dt : 0;
	}


};
