import {describe,it,expect} from 'vitest';
import {businessGraph,containsLegacyIdentity} from './structured-data';
describe('tenant structured data',()=>{
 it('links one organization and its workshop, with honest aliases on the existing website node',()=>{
  const origin='https://3dyanimda.com';
  const graph=businessGraph({name:'3D Yanımda',origin,alternateNames:['3dyanımda','3dyanimda.com','3D Yanında'],email:'info@3dyanimda.com',telephone:'+905364488230',logo:'/logo.png',address:{addressLocality:'Ataşehir',addressRegion:'İstanbul',addressCountry:'TR'}})['@graph'];
  expect(graph).toHaveLength(3);
  expect(graph[0]).toMatchObject({'@id':origin+'/#organization',alternateName:['3dyanımda','3dyanimda.com'],location:{'@id':origin+'/#localbusiness'}});
  expect(graph[1]).toMatchObject({'@id':origin+'/#website',name:'3D Yanımda',alternateName:['3dyanımda','3dyanimda.com'],publisher:{'@id':origin+'/#organization'}});
  expect(graph[2]).toMatchObject({parentOrganization:{'@id':origin+'/#organization'},email:'info@3dyanimda.com',telephone:'+905364488230',logo:origin+'/logo.png'});
  expect(JSON.stringify(graph)).not.toMatch(/sameAs|GeoCoordinates|legalName|foundingDate|aggregateRating|3D Yanında/);
 });
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
 it('publishes Google place links with query parameters but never map embeds as sameAs',()=>{
  const graph=businessGraph({name:'3D Yanımda',origin:'https://3dyanimda.com',
   address:{addressLocality:'Ataşehir',addressCountry:'TR'},hasMap:'https://www.google.com/maps?cid=123',
   sameAs:['https://www.google.com/maps?cid=123','https://www.google.com/maps?cid=123','https://www.google.com/maps/embed?pb=123','https://instagram.com/3dyanimda','https://unknown.example/brand']});
  expect(graph['@graph'][0]).toHaveProperty('sameAs',['https://www.google.com/maps?cid=123','https://instagram.com/3dyanimda']);
  expect(graph['@graph'][2]).toHaveProperty('hasMap','https://www.google.com/maps?cid=123');
 });
 it('uses only configured languages and service areas without creating branch identities',()=>{
  const graph=businessGraph({name:'3D Yanımda',origin:'https://3dyanimda.com',email:'info@3dyanimda.com',address:{addressLocality:'Ataşehir',addressCountry:'TR'},availableLanguages:['Türkçe','English','English'],serviceAreas:['İstanbul','Türkiye']})['@graph'];
  expect(graph[0]).toHaveProperty('contactPoint',[{ '@type':'ContactPoint', contactType:'customer service',email:'info@3dyanimda.com',availableLanguage:['Türkçe','English']}]);
  expect(graph[2]).toHaveProperty('areaServed',[{'@type':'City',name:'İstanbul'},{'@type':'Place',name:'Türkiye'}]);
  expect(graph.filter(node=>node['@type']==='ProfessionalService')).toHaveLength(1);
 });
});
