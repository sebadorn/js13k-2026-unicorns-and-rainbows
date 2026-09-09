import { Renderer } from '../Renderer.js';
import { Wave } from '../Wave.js';


export class Wave2 extends Wave {


	index = 1;
	newFighters = 1;


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
				'Select a spawn field to paint your first fighter',
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
