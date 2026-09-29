export function SectionHeader({
  eyebrow,
  title,
  text,
}: {
  eyebrow?: string;
  title: string;
  text?: string;
}) {
  return (
    <div className="mx-auto mb-8 max-w-2xl text-center">
      {eyebrow ? (
        <p className="text-sm font-black uppercase text-emerald-700">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-2 text-3xl font-black tracking-tight text-emerald-950 md:text-4xl">
        {title}
      </h2>
      {text ? (
        <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">
          {text}
        </p>
      ) : null}
    </div>
  );
}
