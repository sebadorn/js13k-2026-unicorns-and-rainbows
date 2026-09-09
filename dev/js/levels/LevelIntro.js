import { fontFamilySerif } from '../Config.js';
import { Level } from '../Level.js';
import { Colors } from '../MagicColors.js';
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
		'Please guide the brush: Draw a small unicorn',
	];


	/**
	 *
	 */
	constructor() {
		super();

		this.paintingArea = new PaintingArea(
			200, 200,
			() => {
				const nextLevel = new LevelMain();
				nextLevel.unicornPainting = this.paintingArea.getPainting( nextLevel );
				nextLevel.unicornPainting.isOnMap = true;
				nextLevel.unicornPainting.canMove = false;

				Renderer.changeLevel( nextLevel );
			},
		);
		this.paintingArea.offsetY = 120;
		this.paintingArea.showColorSelection = false;
		this.paintingArea.visible = false;
		this.paintingArea.changeColor( Colors.White );

		this._step = 0;
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {CanvasRenderingContext2D} ctxUI
	 */
	draw( ctx, ctxUI ) {
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
		this.paintingArea.draw( ctxUI );
	}


	/**
	 *
	 * @param {Position} pos
	 */
	onClick( pos ) {
		if( this._blockUntil && !this._blockUntil.elapsed() ) {
			return;
		}

		this._blockUntil = new Timer( this, 0.3 );

		if( this._step >= this._texts.length - 1 ) {
			this.paintingArea.visible = true;
			this.paintingArea.onClick( pos );
		}
		else {
			this._step++;
		}
	}


	/**
	 *
	 * @param {Position} pos
	 * @returns {boolean}
	 */
	onMouseMove( pos ) {
		return this.paintingArea.onMouseMove( pos );
	}


};
