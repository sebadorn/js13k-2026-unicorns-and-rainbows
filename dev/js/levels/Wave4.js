import { fontFamilySerif } from '../Config.js';
import { Colors } from '../MagicColors.js';
import { Renderer } from '../Renderer.js';
import { Wave } from '../Wave.js';


export class Wave4 extends Wave {


	index = 3;
	numFighters = 4;
	numTowers = 3;


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
					'Prepare for the coming wave. Fill all fields',
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
				this.createEnemies( [6, 8, 8, 10] );
				this.phase = Wave.PhaseFight;
			}
		}
	}


};
