import { Torch } from './objects/Torch.js';
import { Tile } from './Tile.js';


export const dungeonMapsData = {

	start: {
		layout: [
			'..........',
			'..........',
			'..........',
			'...o..o...',
			'...o..o...',
			'..o....o..',
			'..........',
			'..........',
			'..........',
			'..........',
		],
		setup: {
			playerStart: { x: 5, y: 5 },
			objects: [
				{ x: 4, y: 5, build: ( l, t ) => new Torch( l, t ) },
			],
		},
	},

};


export class DungeonMap {


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
	 * Get all tiles from a given starting tile that can be reached
	 * in a straight line without a blocking tile in the way.
	 * Similar to ray-tracing.
	 * @param {Tile} startTile
	 * @returns {Tile[]}
	 */
	tileTracing( startTile ) {
		const result = [startTile];

		// TODO: check in all directions

		return result;
	}


	/**
	 *
	 * @param {import('./Player').Player} player
	 */
	updateLightMap( player ) {
		const withLightSource = [];

		if( player.lightSource ) {
			withLightSource.push( player );
		}

		this.layout.forEach( line => {
			line.forEach( tile => {
				tile.brightness = 0.1;

				tile.objects.forEach( o => {
					if( o.lightSource ) {
						withLightSource.push( o );
					}
				} );
			} );
		} );

		withLightSource.forEach( o => {
			o.lightSource.updateTiles( this, o.tile );
		} );
	}


};
