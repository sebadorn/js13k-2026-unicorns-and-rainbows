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
 * @param {number[]} pos - [x, y]
 * @param {object}   aabb
 * @param {number}   aabb.x
 * @param {number}   aabb.y
 * @param {number}   aabb.w
 * @param {number}   aabb.h
 * @returns {boolean}
 */
export function isInside( pos, aabb ) {
	return pos[0] >= aabb.x &&
		pos[0] <= aabb.x + aabb.w &&
		pos[1] >= aabb.y &&
		pos[1] <= aabb.y + aabb.h;
};
