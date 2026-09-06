import { fontFamilySans, maxUsesMagicColor } from './Config.js';
import { LevelObject } from './LevelObject.js';


export class UIButton extends LevelObject {


	/** @type {boolean} */
	isHovered = false;


	/**
	 *
	 * @param {import('./Level').Level} level
	 * @param {object} options
	 * @param {number} options.x
	 * @param {number} options.y
	 * @param {number} options.w
	 * @param {number} options.h
	 * @param {string?} options.color
	 * @param {MagicColor?} options.magicColor
	 * @param {string?} options.text
	 * @param {function} onClick
	 */
	constructor( level, options, onClick ) {
		super( level, options.x || 0, options.y || 0, options.w, options.h );

		this.text = options.text;
		this.color = options.color || options.magicColor?.color || '#ddd';
		this.magicColor = options.magicColor;

		this._clickEvent = onClick;
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	draw( ctx ) {
		ctx.save();
		ctx.beginPath();
		ctx.roundRect( this.x, this.y, this.w, this.h, this.h / 4 );
		ctx.clip();

		let usesLeft = 1;

		if( this.magicColor ) {
			usesLeft = ( maxUsesMagicColor - this.magicColor.used ) / maxUsesMagicColor;
		}

		ctx.fillStyle = this.color;
		ctx.fillRect( this.x, this.y, this.w, this.h * usesLeft );
		ctx.restore();

		if( this.isHovered ) {
			ctx.strokeStyle = '#fff';
			ctx.lineWidth = 3;

			ctx.beginPath();
			ctx.roundRect( this.x, this.y, this.w, this.h, this.h / 4 );
			ctx.closePath();
			ctx.stroke();
		}

		if( this.text ) {
			ctx.font = `400 18px ${fontFamilySans}`;
			ctx.fillStyle = '#000';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText( this.text, this.x + this.w / 2, this.y + this.h / 2 );
		}
	}


	/**
	 *
	 */
	onClick() {
		this._clickEvent?.();
	}


};
