import makeNode from '../node/make';
import makeElement from '../element/make';

/**
 * Takes in an element descriptor and resolve it to a uuid and DOM Node.
 *
 * @param descriptor - Element descriptor
 * @return {Object} containing the uuid and DOM node
 */
export default function get(descriptor) {
  const uuid = descriptor.uuid;
  const element = makeElement(descriptor);

  return { uuid, element };
}
