import { useId } from "react";

/** Original lightweight first frame; remains useful without JavaScript or WebGL. */
export default function PrinterPoster() {
  const id = useId().replace(/:/g, "");
  return <svg viewBox="0 0 680 620" role="img" aria-label="Turuncu bir formu katman katman üreten 3D yazıcı" className="printer-poster-svg">
    <defs>
      <linearGradient id={id + "frame"} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#6b747b" /><stop offset=".3" stopColor="#323a40" /><stop offset="1" stopColor="#182027" /></linearGradient>
      <linearGradient id={id + "base"} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#656d72" /><stop offset="1" stopColor="#252d34" /></linearGradient>
      <linearGradient id={id + "orange"}><stop stopColor="#ab360e" /><stop offset=".32" stopColor="#ec6528" /><stop offset=".65" stopColor="#ff9956" /><stop offset="1" stopColor="#c94213" /></linearGradient>
      <radialGradient id={id + "shadow"}><stop stopColor="#33302c" stopOpacity=".22" /><stop offset="1" stopColor="#33302c" stopOpacity="0" /></radialGradient>
    </defs>
    <ellipse cx="354" cy="542" rx="282" ry="55" fill={`url(#${id}shadow)`} />
    <path d="M183 138 443 93 550 158 288 207Z" fill="#747d82" />
    <path d="M183 138 288 207 288 494 183 430Z" fill="#b0b9bd" fillOpacity=".16" />
    <path d="M443 93 550 158 550 449 443 389Z" fill="#434e57" fillOpacity=".17" />
    <path d="M196 144 430 105 430 401 196 441Z" fill="#707b82" fillOpacity=".09" />
    <path d="M178 133 194 130 194 438 178 441ZM434 91 450 94 450 400 434 404ZM278 200 294 202 294 503 278 500ZM540 151 556 160 556 462 540 457Z" fill={`url(#${id}frame)`} />
    <path d="M177 133 443 86 559 152 291 202 291 222 559 173 559 152 443 86 177 133 177 152 291 222 291 202Z" fill={`url(#${id}frame)`} />
    <path d="M177 436 440 390 559 452 292 510Z" fill="#626b70" />
    <path d="M177 436 292 501 559 452 559 493 292 544 177 478Z" fill={`url(#${id}base)`} />
    <path d="M204 424 435 383 524 435 294 478Z" fill="#39434b" stroke="#869198" strokeWidth="1.5" />
    <g stroke="#adb6bb" strokeOpacity=".23" strokeWidth="1">
      {[0, 1, 2, 3, 4, 5].map(n => <path key={n} d={`M${219 + n * 38} ${423 - n * 7}l87 51M${221 + n * 14} ${434 + n * 8}l230-41`} />)}
    </g>
    <path d="M322 430C305 411 305 383 321 366C334 348 382 340 403 356C419 369 418 399 403 413C387 430 345 441 322 430Z" fill={`url(#${id}orange)`} />
    <g fill="none" stroke="#9d350f" strokeOpacity=".36" strokeWidth="1.2">{Array.from({length: 15}, (_, i) => <path key={i} d={`M${313 + Math.sin(i / 14 * Math.PI) * 3} ${372 + i * 4}q38 22 98-16`} />)}</g>
    <ellipse cx="363" cy="362" rx="47" ry="15" transform="rotate(-10 363 362)" fill="#f18a46" stroke="#ffbc80" strokeWidth="2" />
    <ellipse cx="363" cy="362" rx="40" ry="10" transform="rotate(-10 363 362)" fill="#b84c20" />
    <path d="M193 287 448 242 548 299 291 345Z" fill="#4f5b64" />
    <path d="M193 287 291 343 548 299 548 311 291 357 193 300Z" fill="#232e37" />
    <path d="M327 298 370 290 390 302 347 311Z" fill="#8e989e" />
    <path d="M327 298 347 311 390 302 390 340 347 350 327 337Z" fill={`url(#${id}frame)`} />
    <path d="M349 346 366 343 360 361Z" fill="#d4a465" />
    <circle cx="360" cy="362" r="3.5" fill="#ff9348" />
    <path d="M287 221 538 176" stroke="#e0f1f5" strokeWidth="3" />
    <path d="M307 513 385 499 385 518 307 533Z" fill="#121b22" />
    <path d="M318 520 350 514" stroke="#f98948" strokeWidth="3" />
    <path d="M203 486 203 494 230 510 230 501M506 505 506 515 535 508 535 499" stroke="#28323a" strokeWidth="10" />
  </svg>;
}
