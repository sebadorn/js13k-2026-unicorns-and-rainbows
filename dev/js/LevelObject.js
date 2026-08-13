'use strict';


js13k.LevelObject = class {


	_needsRedraw = true;


	/**
	 *
	 * @param {js13k.Level} level
	 * @param {number} w
	 * @param {number} h
	 */
	constructor( level, w , h ) {
		this.level = level;
		this.w = w;
		this.h = h;

		[this.cnv, this.ctx] = js13k.Renderer.getOffscreenCanvas( w, h );
	}


	/**
	 *
	 * @returns {number}
	 */
	calcCenterX() {
		return ( js13k.w - this.w ) / 2;
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} _ctx
	 */
	draw( _ctx ) {}


	/**
	 *
	 * @param {number} _timer
	 */
	update( _timer ) {}


};
