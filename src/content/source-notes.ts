import notes from './source-notes.json';
type Note={revisedAt:string;text:string;scope:string;sources:{id:string;title:string;url:string}[]};
export function sourceNote(path:string):Note|undefined {return (notes as Record<string,Note>)[path];}
export function contentModified(authored:string|undefined,path:string) {
  const revised=sourceNote(path)?.revisedAt;
  return revised && (!authored || Date.parse(revised)>Date.parse(authored)) ? revised : authored;
}
