import { Torch } from './objects/Torch.js';
import { Tile } from './Tile.js';


export const dungeonMapsData = {

	start: {
		layout: [
			'..........',
			'..........',
			'..........',
			'...o..o...',
			'..oo..oo..',
			'..o....o..',
			'..o.......',
			'.......ooo',
			'..........',
			'..........',
		],
		setup: {
			playerStart: { x: 5, y: 5 },
			objects: [
				{ x: 3, y: 5, build: ( l, t ) => new Torch( l, t ) },
			],
		},
	},

};


export class DungeonMap {


	/** @type {number} */
	static minBrightness = 0.1;


	/**
	 *
	 * @param {Tile[][]} layout
	 * @param {object} setup
	 */
	constructor( layout, setup ) {
		this.setup = setup;
		this.layout = layout;
		this.sizeX = layout[0].length;
		this.sizeY = layout.length;
	}


	/**
	 * 
	 * @param {number} x 
	 * @param {number} y 
	 * @returns {Tile?}
	 */
	at( x, y ) {
		return this.layout[y]?.[x];
	}


	/**
	 *
	 * @param {import('./Level').Level} level
	 * @param {object} dungeonMapData
	 * @returns {DungeonMap}
	 */
	static load( level, dungeonMapData ) {
		let layout = dungeonMapData.layout;
		layout = layout.map( ( line, y ) => {
			return line.trim().split( '' ).map( ( char, x ) => {
				return new Tile( x, y, char );
			} );
		} );

		const dungeonMap = new DungeonMap( layout, dungeonMapData.setup );

		dungeonMapData.setup.objects.forEach( o => {
			const tile = dungeonMap.at( o.x, o.y );
			tile?.objects.push( o.build( level, tile ) );
		} );

		return dungeonMap;
	}


	/**
	 *
	 * @param {Tile} tile
	 */
	resetTileVisuals( tile ) {
		tile.brightness = tile.seen ? DungeonMap.minBrightness : 0;
		tile.lightColor = null;
		tile.visible = false;
	}


	/**
	 * Get all tiles from a given starting tile that can be reached
	 * in a straight line without a blocking tile in the way.
	 * Similar to ray-tracing.
	 * @param {Tile} start
	 * @param {number?} rangeLimit
	 * @returns {Tile[]}
	 */
	tileTracing( start, rangeLimit ) {
		const result = [start];

		const addAndCheckContinue = ( x, y, list ) => {
			x = Math.round( x );
			y = Math.round( y );

			const tile = this.at( x, y );

			if( tile ) {
				if( !list.includes( tile ) ) {
					list.push( tile );
				}

				if( rangeLimit > 0 && list.length >= rangeLimit ) {
					return false;
				}
			}

			return tile === start || tile?.isTraversable();
		};

		const checkRay = to => {
			if( result.includes( to ) ) {
				return;
			}

			const list = [];
			const yStart = Math.min( start.y, to.y );
			const yEnd = Math.max( start.y, to.y );

			let rangeX = null;
			let rangeY = null;
			let solverX = ( x, _y ) => x;
			let solverY = ( _x, y ) => y;

			if( start.x === to.x ) {
				rangeY = start.y < to.y ? [yStart, yEnd] : [yEnd, yStart];
			}
			else {
				// y = m * x + b
				const m = ( to.y - start.y ) / ( to.x - start.x );
				const b = start.y - m * start.x;

				const xStart = Math.min( start.x, to.x );
				const xEnd = Math.max( start.x, to.x );

				const diffX = xEnd - xStart;
				const diffY = yEnd - yStart;

				if( diffX > diffY ) {
					solverY = ( x, _y ) => m * x + b;
					rangeX = start.x < to.x ? [xStart, xEnd] : [xEnd, xStart];
				}
				else {
					solverX = ( _x, y ) => ( y - b ) / m;
					rangeY = start.y < to.y ? [yStart, yEnd] : [yEnd, yStart];
				}
			}

			const precision = 1;

			if( rangeX ) {
				const xs = rangeX[0];
				const xe = rangeX[1];

				if( xs <= xe ) {
					for( let x = xs; x <= xe; x += precision ) {
						const y = solverY( x, start.y );

						if( !addAndCheckContinue( x, y, list ) ) {
							break;
						}
					}
				}
				else {
					for( let x = xs; x >= xe; x -= precision ) {
						const y = solverY( x, start.y );

						if( !addAndCheckContinue( x, y, list ) ) {
							break;
						}
					}
				}
			}
			else if( rangeY ) {
				const ys = rangeY[0];
				const ye = rangeY[1];

				if( ys <= ye ) {
					for( let y = ys; y <= ye; y += precision ) {
						const x = solverX( start.x, y );

						if( !addAndCheckContinue( x, y, list ) ) {
							break;
						}
					}
				}
				else {
					for( let y = ys; y >= ye; y -= precision ) {
						const x = solverX( start.x, y );

						if( !addAndCheckContinue( x, y, list ) ) {
							break;
						}
					}
				}
			}

			result.push( ...new Set( list ) );
		};

		// Check top and bottom border tiles as ray targets
		for( let x = 0; x < this.sizeX; x++ ) {
			const targetTop = this.at( x, 0 );
			checkRay( targetTop );

			const targetBottom = this.at( x, this.sizeY - 1 );
			checkRay( targetBottom );
		}

		// Check left and right border tiles as ray targets
		for( let y = 1; y < this.sizeY - 1; y++ ) {
			const targetLeft = this.at( 0, y );
			checkRay( targetLeft );

			const targetRight = this.at( this.sizeX - 1, y );
			checkRay( targetRight );
		}

		return result;
	}


	/**
	 *
	 * @param {import('./Player').Player} player
	 */
	updateLightMap( player ) {
		const withLightSource = [];

		this.layout.forEach( line => {
			line.forEach( tile => {
				this.resetTileVisuals( tile );

				tile.objects.forEach( o => {
					if( o.lightSource ) {
						withLightSource.push( o );
					}
				} );
			} );
		} );

		// Important: Light player light source last, because
		// it is more of an ambient fallback light source.
		if( player.lightSource ) {
			withLightSource.push( player );
		}

		withLightSource.forEach( o => {
			o.lightSource.updateTiles( this, o.tile );
		} );

		const visible = this.tileTracing( player.tile, 10 );
		visible.forEach( t => {
			t.seen = t.seen || t.brightness > DungeonMap.minBrightness;
			t.visible = true;
		} );
	}


};
