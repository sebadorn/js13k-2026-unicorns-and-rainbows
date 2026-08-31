import { LevelObject } from './LevelObject.js';


export class Painting extends LevelObject {


	/** @type {HTMLCanvasElement} */
	canvas;


	/**
	 * 
	 * @param {import('./Level.js').Level} level
	 * @param {HTMLCanvasElement} canvas
	 */
	constructor( level, canvas ) {
		super( level, 0, 0, canvas.width, canvas.height );
		this.canvas = canvas;
	}


};
