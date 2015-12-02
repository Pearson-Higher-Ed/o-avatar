/*global describe, it*/
// 'use strict';

const expect = require('expect.js');

const Avatar = require('../src/js/AvatarView');

describe('Avatar Init', function() {
  it('should initialize', function() {
    const prof = new Avatar();
    expect(prof).to.not.be(null);
  });

});
