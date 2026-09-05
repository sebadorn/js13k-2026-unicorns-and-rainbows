import { fontFamilySerif } from '../Config.js';
import { Level } from '../Level.js';
import { PaintingArea } from '../PaintingArea.js';
import { Renderer } from '../Renderer.js';
import { Timer } from '../Timer.js';
import { LevelMain } from './LevelMain.js';


export class LevelIntro extends Level {


	/** @type {string[]} */
	_texts = [
		'When the Darkness swallowed everything, it seemed like an end',
		'But some motes of magic still stirred',
		'Colorful unicorn magic, painting on a dark canvas',
		'A final pushback',
		'Please guide the brush: Draw a small unicorn',
	];


	/**
	 *
	 */
	constructor() {
		super();

		this._paintingArea = new PaintingArea(
			Renderer.drawWidth / 2 - 150,
			Renderer.drawHeight / 2,
			300, 300,
			() => {
				const nextLevel = new LevelMain();
				nextLevel.unicornPainting = this._paintingArea.getPainting( nextLevel );

				Renderer.changeLevel( nextLevel );
			},
		);
		this._paintingArea.showColorSelection = false;
		this._paintingArea.visible = false;
		this._paintingArea.changeColor( '#fff' );

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
		ctx.font = `600 italic 28px ${fontFamilySerif}`;
		ctx.shadowColor = '#fff';
		ctx.shadowBlur = 16;

		this._texts.forEach( ( line, i ) => {
			if( i <= this._step ) {
				ctx.fillText( line, w / 2, h / 2 - 104 + ( i - this._step ) * 52 );
			}
		} );

		ctx.shadowBlur = 0;
		this._paintingArea.drawOnParent( ctx );
	}


	/**
	 *
	 * @param {Position} pos
	 */
	onClick( pos ) {
		if( this._blockUntil && !this._blockUntil.elapsed() ) {
			return;
		}

		this._blockUntil = new Timer( this, 0.5 );

		if( this._step >= this._texts.length - 1 ) {
			this._paintingArea.visible = true;
			this._paintingArea.onClick( pos );
		}
		else {
			this._step++;
		}
	}


	/**
	 *
	 * @param {Position} pos
	 */
	onMouseDrawing( pos ) {
		this._paintingArea.brushDown( pos );
	}


	/**
	 *
	 * @param {Position} pos
	 * @returns {boolean}
	 */
	onMouseMove( pos ) {
		return this._paintingArea.onMouseMove( pos );
	}


};
