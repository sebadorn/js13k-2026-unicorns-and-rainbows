import { tileSizePx } from './Config.js';
import { DungeonMap } from './DungeonMap.js';


export const CharMeasures = {

	data: {},

	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {string} char
	 * @returns {object}
	 */
	measure( ctx, char ) {
		if( this.data[char] ) {
			return this.data[char];
		}

		// assumes textBaseline = 'alphabetical'
		const metrics = ctx.measureText( char );

		this.data[char] = {
			x: ( tileSizePx - metrics.width ) / 2,
			y: tileSizePx - ( tileSizePx - metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent ) / 2,
		};

		return this.data[char];
	},

};


export class Tile {


	/** @type {string} */
	char = '.';

	/** @type {string} */
	color = '#777';

	/** @type {string?} */
	lightColor;

	/** @type {number} */
	brightness = 1;

	/** @type {import('./objects/LevelObject').LevelObject} */
	objects = [];

	/** @type {boolean} */
	visible = false;

	/** @type {boolean} */
	seen = false;


	/**
	 *
	 * @param {number} x
	 * @param {number} y
	 * @param {string} char
	 */
	constructor( x, y, char ) {
		this.x = x;
		this.y = y;
		this.char = char || this.char;
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	draw( ctx ) {
		if( this.brightness === 0 ) {
			return;
		}

		if( this.visible || this.seen ) {
			const x = this.x * tileSizePx;
			const y = this.y * tileSizePx;

			if( this.lightColor ) {
				ctx.globalAlpha = this.visible ? 0.5 * this.brightness : DungeonMap.minBrightness;
				ctx.fillStyle = this.lightColor;
				ctx.fillRect( x, y, tileSizePx, tileSizePx );
			}

			ctx.globalAlpha = this.visible ? this.brightness : DungeonMap.minBrightness;

			ctx.fillStyle = this.color;

			if( this.char === 'o' ) {
				const size = tileSizePx / 2;
				ctx.fillRect(
					x + size / 2,
					y + size / 2,
					size, size,
				);

				// const radius = tileSizePx / 4;

				// ctx.beginPath();
				// ctx.arc(
				// 	x + radius * 2,
				// 	y + radius * 2,
				// 	radius, 0, Math.PI * 2
				// );
				// ctx.closePath();
				// ctx.fill();
			}
			else {
				const correction = CharMeasures.measure( ctx, this.char );
				ctx.fillText(
					this.char,
					x + correction.x,
					y + correction.y,
					tileSizePx,
				);
			}

			this.objects.forEach( o => o.draw( ctx ) );

			ctx.globalAlpha = 1;
		}
	}


	/**
	 *
	 * @returns {boolean}
	 */
	isTraversable() {
		return this.char === '.';
	}


};
