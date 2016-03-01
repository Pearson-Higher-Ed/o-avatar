/*global describe, it*/
// 'use strict';

const expect = require('expect.js');

const Avatar = require('../src/js/AvatarView');

describe('Avatar Init', function() {
  it('should initialize', function() {
    const av = new Avatar("foo", 'footoken', document.element[0], '160px', true);
    expect(av).to.not.be(null);
  });

});
