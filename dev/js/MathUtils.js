/**
 * Clamp a value to a given range.
 * @param {number} value Value to clamp.
 * @param {number} min Minimum value.
 * @param {number} max Maximum value.
 * @returns {number} Value limited to the range [min, max];
 */
export function clamp( value, min, max ) {
	return Math.max( min, Math.min( max, value ) );
};


/**
 * Calculate the euclidean distance of two positions.
 * @param {Position} a Position a.
 * @param {Position} b Position b.
 * @returns {number} Euclidean distance between a and b.
 */
export function euclidDistance( a, b ) {
	const diffX = b.x - a.x;
	const diffY = b.y - a.y;

	return Math.sqrt( diffX * diffX + diffY * diffY );
};


/**
 *
 * @param {Position} pos
 * @param {Area} aabb
 * @returns {boolean}
 */
export function isInside( pos, aabb ) {
	return pos.x >= aabb.x &&
		pos.x <= aabb.x + aabb.w &&
		pos.y >= aabb.y &&
		pos.y <= aabb.y + aabb.h;
};


/**
 *
 * @param {Position} v
 * @returns {Position}
 */
export function normalizeVector( v ) {
	const length = euclidDistance( { x: 0, y: 0 }, v );

	return {
		x: v.x / length,
		y: v.y / length,
	};
};


/**
 * Return a random (rounded) number from the interval [start, end].
 * @param {number} start
 * @param {number} end
 * @returns {number}
 */
export function randInt( start, end ) {
	const diff = end - start;

	return Math.round( Math.random() * diff + start );
};
