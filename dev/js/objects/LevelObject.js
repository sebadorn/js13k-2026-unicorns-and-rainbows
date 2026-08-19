import { tileSizePx } from '../Config.js';
import { CharMeasures } from '../Tile.js';


export class LevelObject {


	/** @type {import('../Animation').Animation[]} */
	animations = [];


	/**
	 *
	 * @param {import('../Level').Level} level
	 * @param {import('../Tile').Tile} tile
	 * @param {string} char
	 */
	constructor( level, tile, char ) {
		this.level = level;
		this.tile = tile;
		this.char = char;
		this.color = '#fff';
	}


	/**
	 *
	 * @returns {number}
	 */
	get x() { return this.tile.x; }


	/**
	 *
	 * @returns {number}
	 */
	get y() { return this.tile.y; }


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
	 * @param {import('./Tile').Tile} tile 
	 */
	moveToTile( tile ) {
		const index = this.tile?.objects.indexOf( this );

		if( index >= 0 ) {
			this.tile.objects.splice( index, 1 );
		}

		this.tile = tile;
		this.tile.objects.push( this );
	}


	/**
	 *
	 * @param {number} _dt
	 */
	update( _dt ) {}


};
