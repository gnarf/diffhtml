import { pools as _pools } from '../util/pools';

const pools = _pools;

const slice = Array.prototype.slice;
const filter = Array.prototype.filter;

// Patch actions.
export const REMOVE_ELEMENT_CHILDREN = -2;
export const REMOVE_ENTIRE_ELEMENT = -1;
export const REPLACE_ENTIRE_ELEMENT = 0;
export const MODIFY_ELEMENT = 1;
export const MODIFY_ATTRIBUTE = 2;
export const CHANGE_TEXT = 3;

/**
 * Synchronizes changes from the newTree into the oldTree.
 *
 * @param oldTree
 * @param newTree
 * @param patches - optional
 */
export default function sync(oldTree, newTree, patches) {
  patches = patches || [];

  if (!Array.isArray(patches)) {
    throw new Error('Missing Array to sync patches into');
  }

  if (!oldTree) {
    throw new Error('Missing existing tree to sync');
  }

  let oldNodeValue = oldTree.nodeValue;
  let oldChildNodes = oldTree.childNodes;
  let oldChildNodesLength = oldChildNodes ? oldChildNodes.length : 0;
  let oldElement = oldTree.uuid;
  let oldNodeName = oldTree.nodeName;
  let oldIsTextNode = oldNodeName === '#text';

  if (!newTree) {
    let removed = [oldTree].concat(
      oldChildNodes.splice(0, oldChildNodesLength)
    );

    patches.push({
      __do__: REMOVE_ENTIRE_ELEMENT,
      element: oldTree,
      toRemove: removed
    });

    return patches;
  }

  let nodeValue = newTree.nodeValue;
  let childNodes = newTree.childNodes;
  let childNodesLength = childNodes ? childNodes.length : 0;
  let newElement = newTree.uuid;
  let nodeName = newTree.nodeName;
  let newIsTextNode = nodeName === '#text';

  // Replace the key and is attributes.
  oldTree.key = newTree.key;
  oldTree.is = newTree.is;

  // If the element we're replacing is totally different from the previous
  // replace the entire element, don't bother investigating children.
  if (oldTree.nodeName !== newTree.nodeName) {
    patches.push({
      __do__: REPLACE_ENTIRE_ELEMENT,
      old: oldTree,
      new: newTree
    });

    return patches;
  }

  // If the top level nodeValue has changed we should reflect it.
  if (oldIsTextNode && newIsTextNode && oldNodeValue !== nodeValue) {
    patches.push({
      __do__: CHANGE_TEXT,
      element: oldTree,
      value: newTree.nodeValue
    });

    oldTree.nodeValue = newTree.nodeValue;

    return;
  }

  // Most common additive elements.
  if (childNodesLength > oldChildNodesLength) {
    // Store elements in a DocumentFragment to increase performance and be
    // generally simplier to work with.
    let fragment = [];

    for (let i = oldChildNodesLength; i < childNodesLength; i++) {
      // Internally add to the tree.
      oldChildNodes.push(childNodes[i]);

      // Add to the document fragment.
      fragment.push(childNodes[i]);
    }

    oldChildNodesLength = oldChildNodes.length;

    // Assign the fragment to the patches to be injected.
    patches.push({
      __do__: MODIFY_ELEMENT,
      element: oldTree,
      fragment: fragment
    });
  }

  // Remove these elements.
  if (oldChildNodesLength > childNodesLength) {
    // For now just splice out the end items.
    let diff = oldChildNodesLength - childNodesLength;

    // Check if a [key] attr exists for at least one new elements, if you're
    // working with a long list of childNodes it's to your
    // performance-advantage to set the key attribute. That will short-circuit
    // this loop quickly.
    let newHasKeys = childNodes.some(childNode => childNode.key);

    // Store elements to remove here.
    let toRemove = [];

    // If there are no keys set, simply splice off the children.
    if (!newHasKeys) {
      toRemove = oldChildNodes.splice(oldChildNodesLength - diff, diff);
    }
    // If keys are used, do smart detection.
    else {
      let oldKeys = {};
      let newKeys = {};

      // Loop over the old children and caches them and the new nodes into an
      // object for quick lookup.
      oldChildNodes.forEach((oldChildNode, i) => {
        let childNode = childNodes[i];

        if (oldChildNode.key) {
          oldKeys[oldChildNode.key] = oldChildNode;
        }

        if (childNode && childNode.key) {
          newKeys[childNode.key] = childNode;
        }
      });

      [...oldChildNodes].forEach((oldChildNode, i) => {
        // Get the true position of this element.
        const index = oldChildNodes.indexOf(oldChildNode);
        const childNode = childNodes[i];

        const oldKey = {
          old: oldKeys[oldChildNode.key],
          new: newKeys[oldChildNode.key],
        };

        const newKey = {
          old: childNode && oldKeys[childNode.key],
          new: childNode && newKeys[childNode.key],
        };

        // If there is a new element that matches this position, figure out
        // if it's a removal or smart replacement.
        if (childNode) {
          // Will replace elements inline to maintain potential whitespace.
          if (newKey.new && !oldKey.new && oldKey.old) {
            oldChildNodes.splice(index, 1, newKey.new);

            patches.push({
              __do__: MODIFY_ELEMENT,
              old: oldChildNode,
              new: childNode,
            });
          }
          // If this element has a key that does not match and the element
          //else if (newKey.new && oldKey.new && oldChildNode.key !== childNode.key) {
          //  let oldEl = oldChildNodes.splice(index, 1, newKey.new)[0];
          //  oldChildNodes.push(oldEl);
          //}
        }
        else if (oldKey.old && oldKey.new) {
          pools.elementObject.unprotect(oldChildNode);
          oldChildNodes.splice(index, 1);
        }
        else {
          console.log('key >>', oldChildNode.key);
          oldChildNodes.splice(index, 1);
          toRemove.push(oldChildNode);
        }
        // Exists in the new set, so splice it out, since it has already been
        // replaced and we don't to accidentally remove it.
        //else if (oldKey.old && !oldKey.new) {
        //}
        //else if (oldKey.new) {
        //  oldChildNodes.splice(index, 1, oldKey.new);
        //  toRemove.push(oldChildNode);
        //}
        //else {
        //  oldChildNodes.splice(index, 1);
        //  toRemove.push(oldChildNode);
        //}
      });
    }

    console.log('>>>>>>>', oldChildNodes.length, childNodes.length);
    console.log('Nodes >>', oldChildNodes.map(c => JSON.parse(JSON.stringify(c))));

    oldChildNodesLength = oldChildNodes.length;

    if (childNodesLength === 0) {
      patches.push({
        __do__: REMOVE_ELEMENT_CHILDREN,
        element: oldTree,
        toRemove
      });
    }
    else {
      // Remove the element, this happens before the splice so that we still
      // have access to the element.
      toRemove.forEach(old => patches.push({
        __do__: MODIFY_ELEMENT,
        old
      }));
    }
  }

  // Replace elements if they are different.
  if (oldChildNodesLength >= childNodesLength) {
    for (let i = 0; i < childNodesLength; i++) {
      if (oldChildNodes[i].nodeName !== childNodes[i].nodeName) {
        // Add to the patches.
        patches.push({
          __do__: MODIFY_ELEMENT,
          old: oldChildNodes[i],
          new: childNodes[i]
        });

        // Replace the internal tree's point of view of this element.
        oldChildNodes[i] = childNodes[i];
      }
      else {
        sync(oldChildNodes[i], childNodes[i], patches);
      }
    }
  }

  // Synchronize attributes
  let attributes = newTree.attributes;

  if (attributes) {
    let oldLength = oldTree.attributes.length;
    let newLength = attributes.length;

    // Start with the most common, additive.
    if (newLength > oldLength) {
      let toAdd = slice.call(attributes, oldLength);

      for (let i = 0; i < toAdd.length; i++) {
        let change = {
          __do__: MODIFY_ATTRIBUTE,
          element: oldTree,
          name: toAdd[i].name,
          value: toAdd[i].value,
        };

        let attr = pools.attributeObject.get();
        attr.name = toAdd[i].name;
        attr.value = toAdd[i].value;

        pools.attributeObject.protect(attr);

        // Push the change object into into the virtual tree.
        oldTree.attributes.push(attr);

        // Add the change to the series of patches.
        patches.push(change);
      }
    }

    // Check for removals.
    if (oldLength > newLength) {
      let toRemove = slice.call(oldTree.attributes, newLength);

      for (let i = 0; i < toRemove.length; i++) {
        let change = {
          __do__: MODIFY_ATTRIBUTE,
          element: oldTree,
          name: toRemove[i].name,
          value: undefined,
        };

        // Remove the attribute from the virtual node.
        let removed = oldTree.attributes.splice(i, 1);

        for (let i = 0; i < removed.length; i++) {
          pools.attributeObject.unprotect(removed[i]);
        }

        // Add the change to the series of patches.
        patches.push(change);
      }
    }

    // Check for modifications.
    let toModify = attributes;

    for (let i = 0; i < toModify.length; i++) {
      let oldAttrValue = oldTree.attributes[i] && oldTree.attributes[i].value;
      let newAttrValue = attributes[i] && attributes[i].value;

      // Only push in a change if the attribute or value changes.
      if (oldAttrValue !== newAttrValue) {
        let change = {
          __do__: MODIFY_ATTRIBUTE,
          element: oldTree,
          name: toModify[i].name,
          value: toModify[i].value,
        };

        // Replace the attribute in the virtual node.
        let attr = oldTree.attributes[i];
        attr.name = toModify[i].name;
        attr.value = toModify[i].value;

        // Add the change to the series of patches.
        patches.push(change);
      }
    }
  }

  return patches;
}
