/**
 * Module dependencies.
 */

var stream = require('stream');
var util = require('util');
var async = require('async');

/**
 * Expose module.
 */

module.exports = LineWrapper;

/**
 * Create a new line wrapper.
 *
 * @param {Object} options
 * @param {Object} options.prefix
 * @param {Object} options.suffix
 * @param {Object} options.wrapper
 */

function LineWrapper(options) {
  stream.Transform.apply(this, arguments);
  this.prefix = options.prefix || '';
  this.suffix = options.suffix || '';
  this.wrapper = options.wrapper;
}

/**
 * Inherits from Transform stream.
 */

util.inherits(LineWrapper, stream.Transform);

/**
 * Line RegExp.
 */

var lineRegExp = /(.*)([\n\r])/gm;

/**
 * Transform method.
 *
 * @param {Buffer} chunk
 * @param {String} encoding
 * @param {Function} cb
 */

LineWrapper.prototype._transform = function (chunk, encoding, cb) {
  var self = this;

  // Convert chunk to string.
  var str = chunk.toString();

  // If there is a wrapper, we use it.
  if (this.wrapper) {
    // Parse line from string.
    var lines = getLines(str);

    // Map each lines with wrapper.
    async.map(lines, this.wrapper, function (err, wrappedLines) {
      if (err) return cb(err);

      // Push wrapped string to stream.
      push(wrappedLines.join(''));
    });

    return ;
  }

  // If there is no wrapper, we replace using prefix and suffix.
  push(str.replace(lineRegExp, this.prefix + '$1' + this.suffix + '$2'));

  /**
   * Push to stream.
   *
   * @param {String} str
   */

  function push(str) {
    // We push to stream.
    if (! self.push(str)) return cb(new Error('LinePrefixer exploded.'));
    cb();
  }
};


/**
 * Return lines from a string.
 *
 * @param {String} str
 * @returns {String[]}
 */

function getLines(str) {
  var result;
  var lines = [];

  while(result = lineRegExp.exec(str)) {
    lines.push(result[0]);
  }

  return lines;
}