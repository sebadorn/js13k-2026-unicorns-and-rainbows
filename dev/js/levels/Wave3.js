import { Renderer } from '../Renderer.js';
import { Wave } from '../Wave.js';


export class Wave3 extends Wave {


	index = 2;
	newFighters = 1;
	newTowers = 1;


	/**
	 *
	 */
	createEnemies() {
		// TODO:
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	draw( ctx ) {
		const w = Renderer.drawWidth;
		const h = Renderer.drawHeight;

		super.draw( ctx );

		if( this.phase === Wave.PhasePrepare ) {
			ctx.fillText(
				'Prepare for the coming wave',
				w / 2, h * 0.2
			);
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
				this.createEnemies();
				this.phase = Wave.PhaseFight;
			}
		}
	}


};
