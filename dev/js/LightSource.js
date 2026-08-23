import { DungeonMap } from './DungeonMap.js';
import { clamp, euclidDistance } from './MathUtils.js';


export class LightSource {


	/**
	 *
	 * @param {object} options
	 * @param {number} options.brightness
	 * @param {string?} options.color
	 * @param {boolean?} options.isPlayerLight
	 * @param {number} [options.radius = 1]
	 */
	constructor( options ) {
		this.brightness = options.brightness;
		this.color = options.color;
		this.radius = options.radius || 1;
		this.isPlayerLight = options.isPlayerLight;
	}


	/**
	 * 
	 * @param {import('./DungeonMap').DungeonMap} dungeonMap
	 * @param {import('./Tile').Tile} source
	 */
	updateTiles( dungeonMap, source ) {
		if( this.brightness === 0 ) {
			return;
		}

		const tiles = dungeonMap.tileTracing( source, this.radius );

		tiles.forEach( t => {
			if( this.isPlayerLight && ( t.lightColor || t.brightness > DungeonMap.minBrightness ) ) {
				return;
			}

			const dist = euclidDistance( source, t );
			const f = clamp( 1 - dist / this.radius, 0, 1 );

			t.brightness = clamp( t.brightness + f * this.brightness, 0, 1 );
			t.lightColor = this.color || t.lightColor; // TODO: color mixing
		} );

	}


}