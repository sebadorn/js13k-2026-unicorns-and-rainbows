import { tileSizePx } from './Renderer.js';
import { CharMeasures, Tile } from './WorldMap.js';


export class LevelObject extends Tile {


	/**
	 *
	 * @param {import('./Level').Level} level
	 * @param {number} x
	 * @param {number} y
	 * @param {string} char
	 */
	constructor( level, x, y, char ) {
		super( x, y, char );
		this.level = level;
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	draw( ctx ) {
		const correction = CharMeasures.measure( ctx, this.char );

		ctx.fillStyle = this.color;
		ctx.fillText(
			this.char,
			this.x * tileSizePx + correction.x,
			this.y * tileSizePx + correction.y,
			tileSizePx,
		);
	}


	/**
	 *
	 * @param {number} _dt
	 */
	update( _dt ) {}


};
