const stream = require('stream')

const isStream = function(obj) {
  return obj instanceof stream
}

isStream.isReadable = function(obj) {
  return isStream(obj) && typeof obj._read === 'function' && typeof obj._readableState === 'object'
}

isStream.isWritable = function(obj) {
  return isStream(obj) && obj._write === 'function' && typeof obj._writableState === 'object'
}

isStream.isDuplex = function(obj) {
  return isStream.isReadable(obj) && isStream.isWritable(obj)
}

module.exports = isStream