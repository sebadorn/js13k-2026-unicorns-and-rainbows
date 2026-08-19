export class LightSource {


	/**
	 *
	 * @param {object} options
	 * @param {number} options.brightness
	 * @param {string} options.color
	 * @param {number} [options.radius = 1]
	 */
	constructor( options ) {
		this.brightness = options.brightness;
		this.color = options.color;
		this.radius = options.radius || 1;
	}


	/**
	 *
	 * @param {import('./Tile').Tile} tile
	 * @param {number} add
	 */
	applyOnTile( tile, add ) {
		if( !tile ) {
			return;
		}

		tile.brightness = Math.max( 0, Math.min( 1, tile.brightness + add ) );
	}


	/**
	 * 
	 * @param {import('./DungeonMap').DungeonMap} dungeonMap
	 * @param {import('./Tile').Tile} tile
	 */
	updateTiles( dungeonMap, tile ) {
		if( this.brightness === 0 ) {
			return;
		}

		const x = tile.x;
		const y = tile.y;
		const full = this.brightness;
		const dimm = full * 0.5;

		// same tile
		this.applyOnTile( tile, full );

		// left
		this.applyOnTile( dungeonMap.at( x - 1, y ), full );
		// right
		this.applyOnTile( dungeonMap.at( x + 1, y ), full );
		// top
		this.applyOnTile( dungeonMap.at( x, y - 1 ), full );
		// down
		this.applyOnTile( dungeonMap.at( x, y + 1 ), full );

		// top-left
		this.applyOnTile( dungeonMap.at( x - 1, y - 1 ), dimm );
		// top-right
		this.applyOnTile( dungeonMap.at( x + 1, y - 1 ), dimm );
		// bottom-left
		this.applyOnTile( dungeonMap.at( x - 1, y + 1 ), dimm );
		// bottom-right
		this.applyOnTile( dungeonMap.at( x + 1, y + 1 ), dimm );

		// TODO: radius/distance
	}


}