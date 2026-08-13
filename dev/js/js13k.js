'use strict';


/**
 * @namespace js13k
 */
// eslint-disable-next-line no-redeclare
const js13k = {


	// Config
	FONT_MONO: '"Courier New", monospace',
	FONT_SANS: 'Arial, sans-serif',
	FONT_SERIF: '"Times New Roman", serif',
	TARGET_FPS: 60,
	TITLE: 'js13k 2026',


	/**
	 *
	 * @returns {number}
	 */
	get w() {
		return Math.round( js13k.Renderer.cnv.width / js13k.Renderer.scale );
	},


	/**
	 *
	 * @returns {number}
	 */
	get h() {
		return Math.round( js13k.Renderer.cnv.height / js13k.Renderer.scale );
	},


	/**
	 *
	 */
	init() {
		js13k.Input.init();
		js13k.Renderer.init();
		js13k.Renderer.level = new js13k.Level();
		js13k.Renderer.mainLoop();
	},


};


window.addEventListener( 'load', () => js13k.init() );
