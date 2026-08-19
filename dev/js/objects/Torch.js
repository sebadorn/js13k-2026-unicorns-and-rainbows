import { LightSource } from '../LightSource.js';
import { LevelObject } from './LevelObject.js';


export class Torch extends LevelObject {


	/**
	 *
	 * @param {import('../Level').Level} level
	 * @param {import('../Tile').Tile} tile
	 */
	constructor( level, tile ) {
		super( level, tile, 't' );

		this.lightSource = new LightSource( {
			brightness: 0.5,
			color: '#f90',
			radius: 3,
		} );
	}


};
