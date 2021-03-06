import * as diff from '../../lib/index.js';
import { pools } from '../../lib/util/pools';

describe('Integration: Memory management', function() {
  beforeEach(function() {
    this.fixture = document.createElement('div');
    this.fixture.innerHTML = '<div></div>';
  });

  afterEach(function() {
    diff.release(this.fixture);
    diff.removeTransitionState();
  });

  it('can allocate/deallocate uuids', function() {
    diff.innerHTML(this.fixture, '<p></p>');
    assert.equal(pools.elementObject.cache.uuid.size, 2);

    diff.innerHTML(this.fixture, '');
    assert.equal(pools.elementObject.cache.uuid.size, 1);
  });
});
