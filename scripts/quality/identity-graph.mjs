import assert from 'node:assert/strict';

/** HTML's JSON-LD blocks contribute to one dataset (W3C JSON-LD 1.1 §7).
 * Merge complementary fields for the same @id; conflicting supplied values
 * fail rather than allowing an arbitrary first/last script to win.
 */
export function mergeIdentityNodes(schemas, context = '') {
  const nodes = new Map();
  const merge = (left, right, property) => {
    if (left === undefined) return right;
    if (left && right && typeof left === 'object' && typeof right === 'object' && !Array.isArray(left) && !Array.isArray(right)) {
      const result = {...left};
      for (const [key, value] of Object.entries(right)) result[key] = merge(result[key], value, property+'.'+key);
      return result;
    }
    assert.deepEqual(left, right, `Conflicting identity property ${context} ${property}`);
    return left;
  };
  for (const schema of schemas) for (const node of schema['@graph'] || []) {
    if (!node['@id']) continue;
    nodes.set(node['@id'], merge(nodes.get(node['@id']), node, node['@id']));
  }
  return nodes;
}
