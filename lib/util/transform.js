import { pools } from './pools';
import { parse } from './parser';
import { protectElement } from './memory';

/**
 * Creates a virtual element used in or as a virtual tree.
 *
 * @param nodeName
 * @param attributes
 * @param childNodes
 * @return {Object} element
 */
export function createElement(nodeName, attributes, childNodes) {
  if (!nodeName) {
    if (typeof attributes === 'object' || typeof attributes === 'function') {
      return attributes;
    }

    return createElement('#text', null, attributes);
  }

  const entry = pools.elementObject.get();
  const isTextNode = nodeName === 'text' || nodeName === '#text';

  entry.key = '';
  entry.nodeName = nodeName;

  if (!isTextNode) {
    entry.nodeType = 1;
    entry.nodeValue = '';
    entry.attributes = attributes || [];
    entry.childNodes = childNodes;

    entry.attributes.some(attr => {
      if (attr.name === 'key') {
        entry.key = attr.value;
        return true;
      }
    });
  }
  else {
    let value = Array.isArray(childNodes) ? childNodes.join('') : childNodes;

    entry.nodeType = 3;
    entry.nodeValue = value;
    entry.attributes.length = 0;
    entry.childNodes.length = 0;
  }

  protectElement(entry);

  return entry;
}

/**
 * Creates a virtual attribute used in a virtual element.
 *
 * @param name
 * @param value
 * @return {Object} attribute
 */
export function createAttribute(name, value) {
  const entry = pools.attributeObject.get();

  entry.name = name;
  entry.value = value;

  return entry;
}
