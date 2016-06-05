import { count, pools } from '../util/pools';
import makeNode from '../node/make';

/**
 * Ensures that an element is not recycled during a render cycle.
 *
 * @param element
 * @return element
 */
export function protectElement(element) {
  if (Array.isArray(element)) {
    return element.forEach(childNode => protectElement(childNode));
  }

  const elementObject = pools.elementObject;
  const attributeObject = pools.attributeObject;

  elementObject.protect(element);

  element.attributes.forEach(attributeObject.protect, attributeObject);
  element.childNodes.forEach(childNode => protectElement(childNode));

  return element;
}

/**
 * Allows an element to be recycled during a render cycle.
 *
 * @param element
 * @return
 */
export function unprotectElement(element, makeNode) {
  if (Array.isArray(element)) {
    return element.forEach(childNode => unprotectElement(childNode, makeNode));
  }

  const elementObject = pools.elementObject;
  const attributeObject = pools.attributeObject;

  elementObject.unprotect(element);

  element.attributes.forEach(attributeObject.unprotect, attributeObject);
  element.childNodes.forEach(node => unprotectElement(node, makeNode));

  if (makeNode && makeNode.nodes) {
    makeNode.nodes.delete(element);
  }

  return element;
}

/**
 * Recycles all unprotected allocations.
 */
export function cleanMemory(makeNode) {
  const elementObject = pools.elementObject;
  const attributeObject = pools.attributeObject;

  // Empty all element allocations.
  elementObject.cache.allocated.forEach(v => {
    if (elementObject.cache.free.length < count) {
      elementObject.cache.free.push(v);
    }
  });

  elementObject.cache.allocated.clear();

  // Clean out unused elements.
  makeNode.nodes.forEach((v, k) => {
    if (!elementObject.cache.protected.has(k)) {
      makeNode.nodes.delete(k);
    }
  });

  // Empty all attribute allocations.
  attributeObject.cache.allocated.forEach(v => {
    if (attributeObject.cache.free.length < count) {
      attributeObject.cache.free.push(v);
    }
  });

  attributeObject.cache.allocated.clear();
}
