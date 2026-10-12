import assert from 'node:assert/strict';

/** Validate nested entity identity separately from exact authored FAQ content. */
export function assertFAQParity(actual, authored, pageURL) {
  assert.ok(Array.isArray(actual), 'Missing FAQ entities');
  const ids = actual.map(question => question['@id']);
  assert.equal(new Set(ids).size, ids.length, 'Duplicate question identity');
  for (const id of ids) {
    assert.ok(typeof id === 'string' && id.startsWith(pageURL + '#question-') &&
      /^[a-z0-9]+$/.test(id.slice((pageURL + '#question-').length)), 'Invalid question identity');
  }
  assert.deepEqual(actual.map(({['@id']: id, ...question}) => question), authored.map(entry => ({
    '@type': 'Question', name: entry.q, acceptedAnswer: {'@type': 'Answer', text: entry.a},
  })), 'FAQ must exactly match authored questions and answers');
}
