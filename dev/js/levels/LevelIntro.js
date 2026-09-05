import { fontFamilySerif } from '../Config.js';
import { Level } from '../Level.js';
import { Renderer } from '../Renderer.js';
import { Timer } from '../Timer.js';
import { LevelMain } from './LevelMain.js';


export class LevelIntro extends Level {


	/** @type {string[]} */
	_texts = [
		'When the Darkness swallowed everything,\nit was generally considered the end',
		'One unicorn though figured something out...',
		'Strapping a paint brush to their horn,\nusing their rainbow magic,\nthey could bring color back into the world',
		'For one final pushback',
	];


	/**
	 *
	 */
	constructor() {
		super();

		this._step = 0;
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	draw( ctx ) {
		const w = Renderer.drawWidth;
		const h = Renderer.drawHeight;

		ctx.fillStyle = '#000';
		ctx.fillRect( 0, 0, w, h );

		ctx.fillStyle = '#fff';
		ctx.textAlign = 'center';
		ctx.font = `500 32px ${fontFamilySerif}`;

		const lines = this._texts[this._step].split( '\n' );

		lines.forEach( ( line, i ) => {
			ctx.fillText( line, w / 2, h / 2 + i * 64 );
		} );
	}


	/**
	 *
	 * @param {Position} _pos
	 */
	onClick( _pos ) {
		if( this._blockUntil && !this._blockUntil.elapsed() ) {
			return;
		}

		this._blockUntil = new Timer( this, 2 );
		this._step++;

		if( this._step >= this._texts.length ) {
			Renderer.changeLevel( new LevelMain() );
		}
	}


};
