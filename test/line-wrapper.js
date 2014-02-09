var expect = require('chai').expect;
var LineWrapper = require('../lib/line-wrapper');

describe('Line prefixer', function () {
  it('should add a prefix and a suffix', function (done) {
    var lineWrapper = new LineWrapper({ prefix: '@', suffix: 'X' });
    var result = '';

    lineWrapper.on('data', function (data) {
      result += data.toString();
    });

    lineWrapper.on('end', function () {
      expect(result).to.equal('@helloX\n@worldX\r');
      done();
    });

    lineWrapper.write('hello\n');
    lineWrapper.end('world\r');
  });

  it('should wrap each lines', function (done) {
    var lineWrapper = new LineWrapper({ wrapper: prefixLines });
    var result = '';

    function prefixLines(line, cb) {
      cb(null, 'x' + line);
    }

    lineWrapper.on('data', function (data) {
      result += data.toString();
    });

    lineWrapper.on('end', function () {
      expect(result).to.equal('xhello\nxworld\r');
      done();
    });

    lineWrapper.write('hello\n');
    lineWrapper.end('world\r');
  });
});