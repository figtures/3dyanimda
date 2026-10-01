const words = [
  "PRECISION",
  "DESIGN",
  "PRODUCTION",
  "FROM SCAN TO SOLID",
  "DIGITAL PRODUCTION BY YOUR SIDE",
  "AUTOMOTIVE PARTS",
  "PROTOTYPE",
  "REVERSE ENGINEERING",
];

export const Marquee = () => {
  const all = [...words, ...words];
  return (
    <section aria-hidden className="bg-cream border-y border-border overflow-hidden">
      <div className="flex marquee-track whitespace-nowrap py-6">
        {all.map((w, i) => (
          <span key={i} className="font-serif italic text-3xl md:text-5xl text-primary/70 px-8 flex items-center gap-8">
            {w}
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent-blue" />
          </span>
        ))}
      </div>
    </section>
  );
};
