function distanceSquare (x1, y1, x2, y2) {
  return Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)
}
function distance (x1, y1, x2, y2) {
  return Math.sqrt(distanceSquare(x1, y1, x2, y2))
}
module.exports = {
  distanceSquare,
  distance
}
