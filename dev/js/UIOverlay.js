export class UIOverlay {


	/** @type {import('./Painting').Painting} */
	paintings = [];


	/**
	 *
	 * @param {import('./Level').Level} level
	 */
	constructor( level ) {
		this.level = level;
	}


	/**
	 * Add a new painting to the selection.
	 * @param {import('./Painting'.Painting)} painting
	 */
	addPainting( painting ) {
		this.paintings.push( painting );
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	draw( ctx ) {
		// TODO:
	}


	/**
	 *
	 * @param {number} _dt
	 */
	update( _dt ) {
		// TODO:
	}


};
