import { TreeCache } from './tree';
import { cleanMemory, unprotectElement } from '../util/memory';
import { pools } from '../util/pools';

/**
 * Release's the allocated objects and recycles internal memory.
 *
 * @param element
 */
export default function releaseNode(element) {
  let elementMeta = TreeCache.get(element);

  // Do not remove an element that is in process of rendering. User intentions
  // come first, so if we are cleaning up an element being used by another part
  // of the code, keep it alive.
  if (elementMeta) {
    // If there was a tree set up, recycle the memory allocated for it.
    if (elementMeta.oldTree) {
      unprotectElement(elementMeta.oldTree);
    }

    // Remove this element's meta object from the cache.
    TreeCache.delete(element);
  }

  cleanMemory();
}
