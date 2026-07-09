export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="mb-8">
      <p className="label">{eyebrow}</p>
      <h1 className="signage text-3xl mt-1">{title}</h1>
      {description && <p className="text-sm text-smoke mt-3 max-w-lg">{description}</p>}
    </header>
  );
}
