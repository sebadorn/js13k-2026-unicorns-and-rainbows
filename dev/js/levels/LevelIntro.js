import { fontFamilySerif } from '../Config.js';
import { Enemy } from '../Enemy.js';
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
		'Now give shape to the Darkness, something to defeat:',
	];


	/**
	 *
	 */
	constructor() {
		super();

		const nextLevel = new LevelMain();

		this.paintingArea = new PaintingArea(
			220, 220,
			() => {
				nextLevel.unicornPainting = this.paintingArea.getPainting( nextLevel );
				nextLevel.unicornPainting.isOnMap = true;
				nextLevel.unicornPainting.canMove = false;
				nextLevel.unicornPainting.w = 180;
				nextLevel.unicornPainting.h = 180;

				this.paintingArea.clear();
				this._step++;

				this.paintingArea.onDone = () => {
					Enemy.canvas = this.paintingArea.getPainting( nextLevel, true ).canvas;
					Renderer.changeLevel( nextLevel );
				};
			},
		);
		this.paintingArea.offsetY = 160;
		this.paintingArea.titleGap = 120;
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

		ctx.fillStyle = Colors.Black.color;
		ctx.fillRect( 0, 0, w, h );

		ctx.fillStyle = Colors.White.color;
		ctx.textAlign = 'center';
		ctx.font = `600 italic 32px ${fontFamilySerif}`;
		ctx.shadowColor = Colors.White.color;
		ctx.shadowBlur = 16;

		const maxLines = Math.min( this._step, 2 );
		const maxStepY = Math.min( this._step, 3 );

		this._texts.forEach( ( line, i ) => {
			if( i <= maxLines ) {
				const y = h / 2 - 104 + ( i - maxStepY ) * 52;
				ctx.globalAlpha = 1 - ( maxLines - i ) / 2.75;
				ctx.fillText( line, w / 2, y );
			}
		} );

		ctx.globalAlpha = 1;
		ctx.shadowBlur = 0;

		this.paintingArea.title = this._texts[this._step];
		this.paintingArea.draw( ctxUI );
	}


	/**
	 *
	 * @param {Position} pos
	 */
	onClick( pos ) {
		if( this.paintingArea.visible ) {
			this.paintingArea.onClick( pos );
			return;
		}

		if( this._blockUntil && !this._blockUntil.elapsed() ) {
			return;
		}

		this._blockUntil = new Timer( this, 0.3 );

		if( !this.paintingArea.visible && this._step < this._texts.length ) {
			this._step++;
		}

		if( this._step === 3 ) {
			this.paintingArea.visible = true;
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
