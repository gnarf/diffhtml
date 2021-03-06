import * as diff from '../../lib/index';
import { html } from '../../lib/index';
import validateMemory from '../util/validateMemory';

describe('Integration: Tagged template', function() {
  beforeEach(function() {
    this.fixture = document.createElement('div');
    this.fixture.innerHTML = '<div></div>';
  });

  afterEach(function() {
    diff.release(this.fixture);
    diff.removeTransitionState();

    validateMemory();
  });

  describe('Tagged template string function', function() {
    it('works?', function() {
      var actual = html`<div>hello world</div>`;
      var expected = {
        uuid: actual.uuid,
        key: '',
        nodeName: 'div',
        nodeType: 1,
        nodeValue: '',
        attributes: [],
        childNodes: [{
          // We use the real uuid here, because we don't really need to test
          // if a uuid function works here.
          uuid: actual.childNodes[0].uuid,
          key: '',
          nodeName: '#text',
          nodeType: 3,
          nodeValue: 'hello world',
          attributes: [],
          childNodes: [],
        }],
      };

      assert.deepEqual(actual, expected);
    });

    it('works with array of children', function() {
      var items = [1, 2, 3];
      var actual = html`<ul>
        ${items.map(label => html`<li>${label}</li>`)}
      </ul>`;

      var expected = {
        uuid: actual.uuid,
        key: '',
        nodeName: 'ul',
        nodeType: 1,
        nodeValue: '',
        attributes: [],
        childNodes: [{
          // We use the real uuid here, because we don't really need to test
          // if a uuid function works here.
          uuid: actual.childNodes[0].uuid,
          key: '',
          nodeName: 'li',
          nodeType: 1,
          nodeValue: '',
          attributes: [],
          childNodes: [{
            uuid: actual.childNodes[0].childNodes[0].uuid,
            key: '',
            nodeName: '#text',
            nodeValue: '1',
            childNodes: [],
            attributes: [],
            nodeType: 3
          }],
        }, {
          // We use the real uuid here, because we don't really need to test
          // if a uuid function works here.
          uuid: actual.childNodes[1].uuid,
          key: '',
          nodeName: 'li',
          nodeType: 1,
          nodeValue: '',
          attributes: [],
          childNodes: [{
            uuid: actual.childNodes[1].childNodes[0].uuid,
            key: '',
            nodeName: '#text',
            nodeValue: '2',
            childNodes: [],
            attributes: [],
            nodeType: 3
          }],
        }, {
          // We use the real uuid here, because we don't really need to test
          // if a uuid function works here.
          uuid: actual.childNodes[2].uuid,
          key: '',
          nodeName: 'li',
          nodeType: 1,
          nodeValue: '',
          attributes: [],
          childNodes: [{
            uuid: actual.childNodes[2].childNodes[0].uuid,
            key: '',
            nodeName: '#text',
            nodeValue: '3',
            childNodes: [],
            attributes: [],
            nodeType: 3
          }],
        }],
      };

      assert.deepEqual(actual, expected);
    });

    it('can work inside a render method', function() {
      const render = (text) => {
        var actual = html`<div><p>${text}</p></div>`;

        var expected = {
          uuid: actual.uuid,
          key: '',
          nodeName: 'div',
          nodeType: 1,
          nodeValue: '',
          attributes: [],

          childNodes: [{
            uuid: actual.childNodes[0].uuid,
            key: '',
            nodeName: 'p',
            nodeType: 1,
            nodeValue: '',
            attributes: [],

            childNodes: [{
              uuid: actual.childNodes[0].childNodes[0].uuid,
              key: '',
              nodeName: '#text',
              nodeValue: text,
              attributes: [],
              nodeType: 3,

              childNodes: [],
            }],
          }],
        };

        diff.outerHTML(this.fixture, actual);

        return { actual, expected };
      }

      ['hello', 'world', 'foo', 'bar', 'baz'].forEach(text => {
        var pass = render(text);
        assert.deepEqual(pass.actual, pass.expected);
      });
    });

    it('can bind and unbind event handlers', function() {
      var counter = 0;

      function hit() {
        counter++;
      }

      diff.innerHTML(this.fixture, html`<div onclick=${hit}></div>`);
      this.fixture.firstChild.click();

      diff.innerHTML(this.fixture, html`<div></div>`);
      this.fixture.firstChild.click();

      assert.equal(counter, 1);
    });

    it('can render nodes after injecting a list', function() {
      diff.innerHTML(this.fixture, html`
        <section class="main">
          ${html`
            <div>
              <ul>
                ${[1,2,3].forEach(() => html`<li></li>`)}
              </ul>
            </div>

            <footer></footer>
          `}
        </section>
      `);

      assert.ok(this.fixture.querySelector('footer'));
    });
  });
});
