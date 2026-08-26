import { Animation } from './Animation.js';
import { removeItem } from './ArrayUtils.js';
import { Assets } from './Assets.js';
import { LevelObject } from './LevelObject.js';
import { Renderer } from './Renderer.js';


export class Player extends LevelObject {


	/**
	 * 
	 * @param {import('./Level').Level} level
	 * @param {number} x
	 * @param {number} y
	 */
	constructor( level, x, y ) {
		super( level, x, y, 334, 305 );

		this.direction = 1; // +1: right, -1: left

		[this.cnv, this.ctx] = Renderer.getOffscreenCanvas( this.w, this.h );
		this.ctx.drawImage( Assets.get( Assets.IdPlayer ), 0, 0 );
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	draw( ctx ) {
		if( this.direction < 0 ) {
			Renderer.scaleCenter( ctx, -1, 1, this.getCenter() );
		}

		ctx.drawImage( this.cnv, this.x, this.y );

		Renderer.resetTransform();
	}


	/**
	 *
	 * @param {Position} pos
	 */
	walkTo( pos ) {
		// Stop any ongoing walking animation to either start a new one or just stop.
		if( this._walkingAnim ) {
			removeItem( this.animations, this._walkingAnim );
		}

		this.direction = pos.x < this.x ? -1 : 1;

		const distance = Math.abs( pos.x - this.w / 2 - this.x );

		if( distance < 30 ) {
			return;
		}

		const timeNeeded = distance / this.w;
		const startX = this.x;
		const targetX = pos.x - this.w / 2;

		this._walkingAnim = new Animation(
			this.level, timeNeeded,
			progress => {
				this.x = startX * ( 1 - progress ) + targetX * progress;
			},
			animation => {
				this.x = targetX;
				removeItem( this.animations, animation );
				this._walkingAnim = null;
			},
		);

		this.animations.push( this._walkingAnim );
	}


};
