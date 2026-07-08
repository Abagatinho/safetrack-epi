export function Cabecalho({
  eyebrow,
  titulo,
  descricao,
}: {
  eyebrow: string;
  titulo: string;
  descricao?: string;
}) {
  return (
    <header className="mb-8">
      <p className="etiqueta">{eyebrow}</p>
      <h1 className="letreiro text-3xl mt-1">{titulo}</h1>
      {descricao && <p className="text-sm text-fumaca mt-3 max-w-lg">{descricao}</p>}
    </header>
  );
}
