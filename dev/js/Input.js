'use strict';


js13k.Input = {


	_onKeyDown: {},
	_onKeyUp: {},

	keystate: {},


	/**
	 * Initialize the input handler.
	 */
	init() {
		document.body.onkeydown = ev => {
			const ks = this.keystate[ev.code];

			if( !ks || !ks.waitForReset ) {
				this.keystate[ev.code] = {
					time: Date.now()
				};

				if( this._onKeyDown[ev.code] ) {
					this._onKeyDown[ev.code].forEach( cb => cb() );
				}
			}
		};

		document.body.onkeyup = ev => {
			this.keystate[ev.code] = {
				time: 0
			};

			if( this._onKeyUp[ev.code] ) {
				this._onKeyUp[ev.code].forEach( cb => cb() );
			}
		};
	},


	/**
	 *
	 * @param  {string[]} keys
	 * @param  {boolean?} forget
	 * @return {boolean}
	 */
	isPressed( keys, forget ) {
		for( const key of keys ) {
			if( this.isPressedKey( key, forget ) ) {
				return true;
			}
		}

		return false;
	},


	/**
	 * Check if a key is currently being pressed.
	 * @param  {number}  code   - Key code.
	 * @param  {boolean} forget
	 * @return {boolean}
	 */
	isPressedKey( code, forget ) {
		const ks = this.keystate[code];

		if( ks && ks.time ) {
			if( forget ) {
				ks.time = 0;
				ks.waitForReset = true;
			}

			return true;
		}

		return false;
	},


	/**
	 * Add a listener for the keydown event.
	 * @param {string}   code - Key code.
	 * @param {function} cb   - Callback.
	 */
	onKeyDown( code, cb ) {
		const list = this._onKeyDown[code] || [];
		list.push( cb );
		this._onKeyDown[code] = list;
	},


	/**
	 * Add a listener for the keyup event.
	 * @param {string}   code - Key code.
	 * @param {function} cb   - Callback.
	 */
	onKeyUp( code, cb ) {
		const list = this._onKeyUp[code] || [];
		list.push( cb );
		this._onKeyUp[code] = list;
	},


};