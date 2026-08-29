import { LevelObject } from './LevelObject.js';


export class Painting extends LevelObject {


	/** @type {HTMLCanvasElement} */
	canvas;

	/** @type {CanvasRenderingContext2D} */
	ctx;


	/**
	 * 
	 * @param {import('./Level.js').Level} level
	 * @param {HTMLCanvasElement} canvas
	 * @param {CanvasRenderingContext2D} ctx
	 */
	constructor( level, canvas, ctx ) {
		super( level, 0, 0, canvas.width, canvas.height );

		this.canvas = canvas;
		this.ctx = ctx;

	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	draw( ctx ) {
		ctx.drawImage( this.canvas, this.x, this.y );
	}


};
