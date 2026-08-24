import { Animation } from './Animation.js';
import { removeItem } from './ArrayUtils.js';
import { LevelObject } from './LevelObject.js';


export class Player extends LevelObject {


	/**
	 * 
	 * @param {import('./Level').Level} level
	 * @param {number} x
	 * @param {number} y
	 */
	constructor( level, x, y ) {
		super( level, x, y, 200, 140 );
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	draw( ctx ) {
		ctx.fillStyle = '#f00';
		ctx.fillRect( this.x, this.y, this.w, this.h );
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

		const distance = Math.abs( pos.x - this.x );

		if( distance < 100 ) {
			return;
		}

		const timeNeeded = distance / 250;
		const startX = this.x;
		const targetX = pos.x;

		this._walkingAnim = new Animation(
			this.level, timeNeeded,
			progress => {
				this.x = startX + targetX * progress;
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
