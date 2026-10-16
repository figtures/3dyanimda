import DOMPurify from 'isomorphic-dompurify';

DOMPurify.addHook('uponSanitizeAttribute', (_node, attribute) => {
  if (attribute.attrName === 'src' && /^data:/i.test(attribute.attrValue) &&
      !/^data:image\/(?:png|jpe?g|webp|gif|avif);base64,[a-z0-9+/=\s]+$/i.test(attribute.attrValue)) {
    attribute.keepAttr = false;
  }
});

// Apply at every rendering boundary, including SSG. Editor-side validation alone
// does not cover existing database rows or writes made through the Data API.
DOMPurify.addHook('afterSanitizeAttributes', node => {
  if ('getAttribute' in node && node.getAttribute('target') === '_blank') {
    node.setAttribute('rel', 'noopener noreferrer');
  }
});

export function safeHtml(value: unknown): string {
  return DOMPurify.sanitize(typeof value === 'string' ? value : '', {
    ALLOWED_TAGS: ['p','br','hr','span','div','h1','h2','h3','h4','h5','h6','strong','b','em','i','u','s','del','blockquote','pre','code','ul','ol','li','a','img','figure','figcaption','table','thead','tbody','tfoot','tr','th','td','caption','sup','sub'],
    ALLOWED_ATTR: ['class','href','title','target','rel','src','alt','width','height','loading','colspan','rowspan','scope','start'],
    ALLOW_DATA_ATTR: false,
    ALLOW_ARIA_ATTR: false,
    FORBID_TAGS: ['style','script','svg','math','iframe','object','embed','form','input','button','textarea','select','template'],
    FORBID_ATTR: ['style','srcset','id','name'],
    RETURN_TRUSTED_TYPE: false,
  });
}
