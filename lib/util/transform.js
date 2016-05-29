import { pools } from './pools';
import { parse } from './parser';

/**
 * Normalizes input childNodes that may or may not be well-formed VTree
 * objects.
 *
 * @param childNodes
 * @return {Array} new child nodes
 */
export function normalizeChildNodes(childNodes) {
  const newChildNodes = [];

  [].concat(childNodes).forEach((childNode) => {
    // Handle string values.
    if (typeof childNode !== 'object') {
      let nodes = parse(String(childNode)).childNodes;
      let filtered = nodes.length === 1 ? nodes[0] : nodes;
      let isArray = Array.isArray(filtered);
      let truthy = filtered && !(isArray && filtered.length === 0);

      if (truthy) {
        [].concat(filtered).forEach(childNode => {
          newChildNodes.push(childNode);
        });
      }
    }
    // Handle array values.
    else if (Array.isArray(childNode)) {
      childNode.forEach(childNode => {
        newChildNodes.push(childNode);
        if (childNode.nodeType !== 1) { return; }
        childNode.childNodes = normalizeChildNodes(childNode.childNodes);
      });
    }
    // Handle the rest.
    else if (childNode.nodeType === 1) {
      childNode.childNodes = normalizeChildNodes(childNode.childNodes);
      newChildNodes.push(childNode);
    }
    else {
      newChildNodes.push(childNode);
    }
  });

  //FIXME
  //newChildNodes.forEach(childNode => {
  //  // Ensure attributes are nomralized as well.
  //  childNode.attributes = childNode.attributes.filter(attr => attr.name);
  //});

  return newChildNodes;
}

/**
 * Creates a virtual element used in or as a virtual tree.
 *
 * @param nodeName
 * @param attributes
 * @param childNodes
 * @return {Object} element
 */
export function createElement(nodeName, attributes, childNodes) {
  const entry = pools.elementObject.get();
  const isTextNode = nodeName === 'text' || nodeName === '#text';

  entry.key = '';
  entry.nodeName = nodeName;
  entry.nodeType = isTextNode ? 3 : 1;

  if (!isTextNode) {
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
    entry.nodeValue = Array.isArray(childNodes) ? childNodes.join('') : childNodes;
    entry.attributes.length = 0;
    entry.childNodes.length = 0;
  }

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

