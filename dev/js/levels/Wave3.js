import { fontFamilySerif } from '../Config.js';
import { Colors } from '../MagicColors.js';
import { Renderer } from '../Renderer.js';
import { Wave } from '../Wave.js';


export class Wave3 extends Wave {


	index = 2;
	numFighters = 3;
	numTowers = 2;


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
					`${this.numTowers} towers, ${this.numFighters} fighters`,
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
				this.createEnemies( [6, 8, 10] );
				this.phase = Wave.PhaseFight;
			}
		}
	}


};
