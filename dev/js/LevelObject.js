import { Tile } from './DungeonMap.js';


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
	 * @param {number} _dt
	 */
	update( _dt ) {}


};
