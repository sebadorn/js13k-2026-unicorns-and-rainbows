import { fontFamilySerif } from '../Config.js';
import { Colors } from '../MagicColors.js';
import { Renderer } from '../Renderer.js';
import { Wave } from '../Wave.js';


export class Wave2 extends Wave {


	index = 1;
	numFighters = 2;
	numTowers = 1;


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	draw( ctx ) {
		super.draw( ctx );

		if( this.phase === Wave.PhasePrepare ) {
			if( !this.level.paintingArea.visible ) {
				ctx.font = `500 italic 46px ${fontFamilySerif}`;
				ctx.fillStyle = Colors.White.color;
				ctx.textAlign = 'center';

				ctx.fillText(
					'Add two new fighters to support you',
					Renderer.drawWidth / 2, 150 + Math.sin( this.level.timer / 50 ) * 5
				);
			}
		}
	}


	/**
	 *
	 * @param {number} dt
	 */
	update( dt ) {
		super.update( dt );

		if( this.phase === Wave.PhasePrepare ) {
			if( this.level.hasAllUnits() ) {
				this.createEnemies( [4, 6, 6] );
				this.level.paintingArea.visible = false;
				this.phase = Wave.PhaseFight;
			}
		}
	}


};
