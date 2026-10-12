import {test} from 'node:test';
import assert from 'node:assert/strict';
import {assertFAQParity} from './faq-parity.mjs';
const url = 'https://brand.example/3d-baski';
const authored = [{q: 'Which material?', a: 'Select after checking the use case.'}];
const entities = () => [{'@id': url + '#question-abc123', '@type': 'Question', name: authored[0].q,
  acceptedAnswer: {'@type': 'Answer', text: authored[0].a}}];
test('identified FAQ entities retain exact authored content parity', () => {
  assertFAQParity(entities(), authored, url);
});
test('changed answer, omitted question and extra properties fail', () => {
  const changed = entities(); changed[0].acceptedAnswer.text = 'Unapproved answer';
  assert.throws(() => assertFAQParity(changed, authored, url));
  assert.throws(() => assertFAQParity([], authored, url));
  const extra = entities(); extra[0].url = 'https://other.example';
  assert.throws(() => assertFAQParity(extra, authored, url));
});
test('missing, cross-page and duplicate question identities fail', () => {
  for (const id of [undefined, 'https://other.example/#question-abc', url + '#question-']) {
    const bad = entities(); bad[0]['@id'] = id;
    assert.throws(() => assertFAQParity(bad, authored, url));
  }
  assert.throws(() => assertFAQParity([...entities(), ...entities()], [...authored, ...authored], url));
});
