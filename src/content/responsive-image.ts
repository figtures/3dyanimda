export function serviceImageSources(image:string) {
 const match=/^\/brand\/services\/(3dyanimda|3dsanayi|maketyanimda|parcayanimda)-(print|scan|model)\.webp$/.exec(image);
 return match?[640,1024].map(width=>`/brand/optimized/service-${match[1]}-${match[2]}-${width}.avif ${width}w`).join(', '):undefined;
}
