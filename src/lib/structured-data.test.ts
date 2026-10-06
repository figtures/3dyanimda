import {describe,it,expect} from 'vitest';
import {businessGraph,containsLegacyIdentity} from './structured-data';
describe('tenant structured data',()=>{
 it('keeps legitimate Beylikdüzü area data while rejecting source company identity',()=>{
  expect(containsLegacyIdentity({areaServed:{name:'Beylikdüzü'}})).toBe(false);
  expect(containsLegacyIdentity({url:'https://3dyaninda.com/'})).toBe(true);
  expect(containsLegacyIdentity({url:'https://3dyanimda.com/'})).toBe(false);
 });
 it('creates one business entity without invented contact, coordinates or opening hours',()=>{
  const graph=businessGraph({name:'3dsanayi',origin:'https://3dsanayi.com'});
  expect(graph['@graph']).toHaveLength(2);
  expect(JSON.stringify(graph)).not.toMatch(/telephone|GeoCoordinates|openingHours/);
  expect(graph['@graph'][1]['@id']).toBe('https://3dsanayi.com/#website');
  expect(JSON.stringify(graph)).not.toContain('PostalAddress');
  const verified=businessGraph({name:'3dsanayi',origin:'https://3dsanayi.com',address:{addressLocality:'Ataşehir',addressCountry:'TR'}});
  expect(verified['@graph']).toHaveLength(3);
  expect(verified['@graph'][2]['@id']).toBe('https://3dsanayi.com/#localbusiness');
 });
});
