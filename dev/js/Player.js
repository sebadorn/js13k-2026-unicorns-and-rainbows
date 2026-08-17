import { LevelObject } from './LevelObject.js';


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


export class Player extends LevelObject {


	/**
	 * 
	 * @param {import('./Level').Level} level
	 * @param {number} x
	 * @param {number} y
	 */
	constructor( level, x, y ) {
		super( level, x, y, '@' );
		this.color = '#fff';
	}


};
