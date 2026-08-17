import { tileSizePx } from './Renderer.js';


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


	/** @type {number} */
	x = 0;

	/** @type {number} */
	y = 0;

	/** @type {string} */
	char = '.';

	/** @type {string} */
	color = '#777';

	/** @type {import('./Animation').Animation[]?} */
	animations;


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


};



export const WorldMap = {

	/** @type {Tile[][]} */
	data: [
		['.', '.', '.', '.', '.', '.'],
		['.', '.', 'y', '.', '.', '.'],
		['.', '.', '.', '.', '.', '.'],
		['.', 'l', '.', '.', '.', '.'],
		['.', '.', '.', 's', 'o', '.'],
		['.', '.', '.', '.', '.', '.'],
	].map( ( line, y ) => line.map( ( char, x ) => {
		return new Tile( x, y, char );
	} ) ),

	/**
	 * 
	 * @param {number} x 
	 * @param {number} y 
	 * @returns {Tile}
	 */
	at( x, y ) {
		return this.data[y][x];
	},

};

WorldMap.sizeX = WorldMap.data[0].length;
WorldMap.sizeY = WorldMap.data.length;
