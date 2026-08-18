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

	/** @type {import('./Animation.js').Animation[]?} */
	animations;

	/** @type {number} */
	brightness = 1;


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
		const correction = CharMeasures.measure( ctx, this.char );

		ctx.globalAlpha = this.brightness;
		ctx.fillStyle = this.color;
		ctx.fillText(
			this.char,
			this.x * tileSizePx + correction.x,
			this.y * tileSizePx + correction.y,
			tileSizePx,
		);
		ctx.globalAlpha = 1;
	}


	/**
	 *
	 * @returns {boolean}
	 */
	isTraversable() {
		return this.char === '.';
	}


};


export const dungeonMapsData = {

	start: {
		layout: `
			..........
			..........
			..........
			...o..o...
			...o..o...
			..o....o..
			..........
			..........
			..........
			..........
		`,
		setup: {
			playerStart: [5, 5],
		},
	},

};


export class DungeonMap {


	/**
	 *
	 * @param {Tile[][]} layout
	 * @param {object} setup
	 */
	constructor( layout, setup ) {
		this.setup = setup;
		this.layout = layout;
		this.sizeX = layout[0].length;
		this.sizeY = layout.length;
	}


	/**
	 * 
	 * @param {number} x 
	 * @param {number} y 
	 * @returns {Tile?}
	 */
	at( x, y ) {
		return this.layout[y]?.[x];
	}


	/**
	 *
	 * @param {object} dungeonMapData
	 * @returns {DungeonMap}
	 */
	static load( dungeonMapData ) {
		let layout = dungeonMapData.layout;
		layout = layout.trim().split( '\n' );
		layout = layout.map( ( line, y ) => {
			return line.trim().split( '' ).map( ( char, x ) => {
				return new Tile( x, y, char );
			} );
		} );

		return new DungeonMap( layout, dungeonMapData.setup );
	}


	/**
	 *
	 * @param {import('./Player').Player} player
	 */
	updateLightMap( player ) {
		this.layout.forEach( line => {
			line.forEach( tile => {
				const diffX = tile.x - player.x;
				const diffY = tile.y - player.y;
				const distance = Math.sqrt( diffX * diffX + diffY * diffY );

				tile.brightness = Math.min( 1, 1.1 - Math.min( 4, distance ) / 4 );
			} );
		} );
	}


};
