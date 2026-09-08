import { Enemy } from '../Enemy.js';
import { randInt } from '../MathUtils.js';
import { Renderer } from '../Renderer.js';
import { Wave } from '../Wave.js';


export class Wave1 extends Wave {


	index = 0;
	newTowers = 1;


	/**
	 *
	 * @private
	 */
	createEnemies() {
		const w = Renderer.drawWidth;
		const h = Renderer.drawHeight;

		const tower = this.level.towers[0];
		const isLeft = tower.x < w / 2;
		const isTop = tower.y + tower.h < h / 2;

		// Spawn enemies close to the only defense tower.
		this.enemies = [
			new Enemy(
				this.level,
				( isLeft ? 0 : w ) + randInt( -100, 100 ),
				( isTop ? 0 : h ) + randInt( -100, 100 ),
				60, 60
			),
			new Enemy(
				this.level,
				( isLeft ? 0 : w ) + randInt( -100, 100 ),
				( isTop ? 0 : h ) + randInt( -100, 100 ),
				60, 60
			),
		];
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
				this.createEnemies();
				this.phase = Wave.PhaseFight;
			}
		}
	}


};
