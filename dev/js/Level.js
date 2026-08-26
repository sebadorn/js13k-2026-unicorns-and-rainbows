export class Level {


	/** @type {import('./LevelObject').LevelObject[]} */
	objects = [];


	/**
	 *
	 * @constructor
	 */
	constructor() {
		this.timer = 0;
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	draw( _ctx ) {}


	/**
	 *
	 * @param {Position} _pos
	 */
	onClick( _pos ) {}


	/**
	 *
	 * @param {Position} _pos
	 * @returns {boolean}
	 */
	onMouseMove( _pos ) {
		return false;
	}


	/**
	 *
	 * @param {number} dt
	 */
	update( dt ) {
		this.timer += dt;
		this.objects.forEach( o => o.update( dt ) );
		this.player?.update( dt );
	}


};
