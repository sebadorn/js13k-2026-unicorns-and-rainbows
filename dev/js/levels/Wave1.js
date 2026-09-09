import { Renderer } from '../Renderer.js';
import { Wave } from '../Wave.js';


export class Wave1 extends Wave {


	index = 0;
	newTowers = 1;


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	draw( ctx ) {
		const w = Renderer.drawWidth;
		const h = Renderer.drawHeight;

		super.draw( ctx );

		if( this.phase === Wave.PhasePrepare ) {
			if( !this.level.paintingArea.visible ) {
				ctx.fillText(
					'Select a field to paint your first tower',
					w / 2, h * 0.2
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
				this.createEnemies( [2, 2] );
				this.phase = Wave.PhaseFight;
			}
		}
	}


};
