import { Input } from './Input.js';
import { Player, PlayerAction } from './Player.js';
import { Renderer, tileSizePx } from './Renderer.js';
import { CharMeasures, WorldMap } from './WorldMap.js';


export class Level {


	/**
	 *
	 * @constructor
	 */
	constructor() {
		this.timer = 0;

		/** @type {import('./Animation').Animation[]} */
		this.animations = [];

		this.player = new Player( this, 2, 2 );
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	draw( ctx ) {
		ctx.translate(
			Renderer.center.x - WorldMap.sizeX / 2 * tileSizePx,
			Renderer.center.y - WorldMap.sizeY / 2 * tileSizePx,
		);

		for( let y = 0; y < WorldMap.sizeY; y++ ) {
			for( let x = 0; x < WorldMap.sizeX; x++ ) {
				if( x === this.player.x && y === this.player.y ) {
					continue;
				}

				const tile = WorldMap.at( x, y );
				this.drawTile( ctx, tile );
			}
		}

		this.player.draw( ctx );
		this.animations.forEach( anim => anim.do() );
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {import('./WorldMap').Tile} tile
	 */
	drawTile( ctx, tile ) {
		const correction = CharMeasures.measure( ctx, tile.char );

		ctx.fillStyle = tile.color;
		ctx.fillText(
			tile.char,
			tile.x * tileSizePx + correction.x,
			tile.y * tileSizePx + correction.y,
			tileSizePx,
		);

		// // Debug grid
		// ctx.strokeStyle = '#f00';
		// ctx.strokeRect( tile.x * tileSizePx, tile.y * tileSizePx, tileSizePx, tileSizePx );
	}


	/**
	 * 
	 * @param {number} action
	 */
	onKey( action ) {
		if( Renderer.isPaused ) {
			return;
		}

		let x = this.player.x;
		let y = this.player.y;

		if( action === PlayerAction.Up.enum ) {
			y--;
		}
		else if( action === PlayerAction.Down.enum ) {
			y++;
		}
		else if( action === PlayerAction.Left.enum ) {
			x--;
		}
		else if( action === PlayerAction.Right.enum ) {
			x++;
		}
		else if( action === PlayerAction.Interact.enum ) {
			// TODO: check neighbouring tiles for objects to interact with
		}

		x = Math.max( 0, Math.min( WorldMap.sizeX - 1, x ) );
		y = Math.max( 0, Math.min( WorldMap.sizeY - 1, y ) );

		// TODO: also check for non-traversable tiles like walls

		this.player.x = x;
		this.player.y = y;
	}


	/**
	 *
	 * @param {number} dt
	 */
	update( dt ) {
		this.timer += dt;

		if( Input.isPressed( PlayerAction.Up.keys, true ) ) {
			this.onKey( PlayerAction.Up.enum );
		}
		else if( Input.isPressed( PlayerAction.Left.keys, true ) ) {
			this.onKey( PlayerAction.Left.enum );
		}
		else if( Input.isPressed( PlayerAction.Down.keys, true ) ) {
			this.onKey( PlayerAction.Down.enum );
		}
		else if( Input.isPressed( PlayerAction.Right.keys, true ) ) {
			this.onKey( PlayerAction.Right.enum );
		}
		else if( Input.isPressed( PlayerAction.Interact.keys, true ) ) {
			this.onKey( PlayerAction.Interact.enum );
		}

		this.player.update( dt );
	}


};
