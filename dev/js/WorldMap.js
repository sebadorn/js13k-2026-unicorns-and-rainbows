export class WorldField {


	/** @type {number} */
	x = 0;

	/** @type {number} */
	y = 0;

	/** @type {string} */
	char = '.';

	/** @type {string} */
	color = '#fff';

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

	/** @type {WorldField[][]} */
	data: [
		['.', '.', '.', '.', '.'],
		['.', '.', '.', '.', '.'],
		['.', '.', '.', '.', '.'],
		['.', '.', '.', '.', '.'],
		['.', '.', '.', '.', '.'],
	].map( ( line, y ) => line.map( ( char, x ) => {
		return new WorldField( x, y, char );
	} ) ),

	/**
	 * 
	 * @param {number} x 
	 * @param {number} y 
	 * @returns {WorldField}
	 */
	at( x, y ) {
		return this.data[y][x];
	},

};

WorldMap.sizeX = WorldMap.data[0].length;
WorldMap.sizeY = WorldMap.data.length;
