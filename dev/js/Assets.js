const cache = {};


export const Assets = {


	IdPlayer: 'img/unicorn_01.gif',


	/**
	 *
	 * @param {string} id
	 * @returns {Image}
	 */
	get( id ) {
		return cache[id];
	},


	/**
	 * Load assets into cache.
	 */
	async init() {
		cache[this.IdPlayer] = await this._loadAsset( this.IdPlayer );
	},


	/**
	 *
	 * @param {string} src
	 * @returns {Promise}
	 */
	async _loadAsset( src ) {
		return new Promise( ( resolve, reject ) => {
			const img = new Image();
			img.onload = () => resolve( img );
			img.onerror = () => reject();
			img.src = src;
		} );
	},


};
