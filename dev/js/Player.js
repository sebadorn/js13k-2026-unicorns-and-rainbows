import { LevelObject } from './LevelObject.js';


export class Player extends LevelObject {


	/**
	 * 
	 * @param {import('./Level').Level} level
	 */
	constructor( level ) {
		super( level );
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
