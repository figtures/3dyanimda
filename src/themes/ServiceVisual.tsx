/** Service illustrations describe a process; actual part models live only in the gallery. */
export default function ServiceVisual({ service }: { service: number }) {
  const flows = [
    ["Dijital model", "Üretim planı", "Fiziksel parça"],
    ["Mevcut parça", "Yüzey verisi", "Dijital referans"],
    ["Fikir & ölçü", "CAD tasarımı", "Üretim dosyası"],
  ];
  return (
    <div className="service-visual" data-service-visual={service}>
      <svg viewBox="0 0 440 300" aria-hidden="true" focusable="false">
        <g fill="none" stroke="currentColor" strokeWidth="1">
          <path
            d="M38 60V30H68 M372 30H402V60 M38 240V270H68 M372 270H402V240"
            opacity=".3"
          />
          {service === 0 ? (
            <g>
              {Array.from({ length: 7 }, (_, i) => (
                <path
                  key={i}
                  d={`M105 ${179 - i * 14} Q220 ${112 - i * 14} 335 ${179 - i * 14} L335 ${200 - i * 14} Q220 ${266 - i * 14} 105 ${200 - i * 14} Z`}
                  fill="currentColor"
                  fillOpacity={0.025 + i * 0.009}
                  strokeOpacity={0.18 + i * 0.1}
                />
              ))}
              <path
                d="M220 32V8 M212 17L220 8L228 17 M355 72V238 M350 72H360 M350 238H360"
                opacity=".5"
              />
            </g>
          ) : service === 1 ? (
            <g>
              <ellipse
                cx="220"
                cy="155"
                rx="108"
                ry="76"
                strokeDasharray="3 7"
                opacity=".35"
              />
              {Array.from({ length: 11 }, (_, r) =>
                Array.from({ length: 17 }, (_, c) => {
                  const x = (c - 8) / 8,
                    y = (r - 5) / 5;
                  return x * x + y * y < 1 ? (
                    <circle
                      key={`${r}-${c}`}
                      cx={220 + x * 100}
                      cy={155 + y * 75 + Math.sin(c * 0.65) * 12}
                      r={1.3 + (1 - Math.abs(x))}
                      fill="currentColor"
                      stroke="none"
                      opacity={0.25 + (1 - Math.abs(x)) * 0.6}
                    />
                  ) : null;
                }),
              )}
              <path d="M78 100H362 M78 108H362" strokeWidth="2" />
              <path
                d="M78 108L105 232H335L362 108"
                fill="currentColor"
                fillOpacity=".035"
                stroke="none"
              />
              <path
                d="M90 73V100H117 M350 73V100H323 M90 255V228H117 M350 255V228H323"
                opacity=".5"
              />
            </g>
          ) : (
            <g>
              <path
                d="M100 215L145 85L260 60L340 185L220 242Z"
                fill="currentColor"
                fillOpacity=".04"
              />
              <path
                d="M100 215L260 60 M145 85L220 242 M340 185L145 85 M100 215L340 185 M220 242L260 60"
                opacity=".55"
              />
              {[
                [100, 215],
                [145, 85],
                [260, 60],
                [340, 185],
                [220, 242],
              ].map(([x, y]) => (
                <rect
                  key={x}
                  x={x - 4}
                  y={y - 4}
                  width="8"
                  height="8"
                  fill="var(--paper)"
                />
              ))}
              <path
                d="M100 265H340 M100 258V272 M340 258V272 M73 85V215 M66 85H80 M66 215H80"
                opacity=".4"
              />
              <circle
                cx="220"
                cy="153"
                r="29"
                strokeDasharray="4 5"
                opacity=".5"
              />
            </g>
          )}
        </g>
      </svg>
      <ol className="service-flow">
        {flows[service].map((label, i) => (
          <li key={label}>
            <span>0{i + 1}</span>
            {label}
          </li>
        ))}
      </ol>
    </div>
  );
}
