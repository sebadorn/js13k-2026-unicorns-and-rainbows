import { LightSource } from './LightSource.js';
import { LevelObject } from './objects/LevelObject.js';


export class Player extends LevelObject {


	/**
	 * 
	 * @param {import('./Level').Level} level
	 * @param {import('./Tile').Tile} tile
	 */
	constructor( level, tile ) {
		super( level, tile, '@' );

		this.lightSource = new LightSource( {
			brightness: 0.2,
			color: '#fff',
			radius: 2,
		} );
	}


};


export const PlayerAction = {
	Up: {
		keys: ['KeyW', 'ArrowUp'],
		enum: 1,
	},
	Right: {
		keys: ['KeyD', 'ArrowRight'],
		enum: 2,
	},
	Down: {
		keys: ['KeyS', 'ArrowDown'],
		enum: 3,
	},
	Left: {
		keys: ['KeyA', 'ArrowLeft'],
		enum: 4,
	},
	Interact: {
		keys: ['KeyE'],
		enum: 5,
	},
};
