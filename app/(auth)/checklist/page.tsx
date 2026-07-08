import { ChecklistForm } from "./ChecklistForm";
import { Cabecalho } from "@/components/ui/Cabecalho";

export default function ChecklistPage() {
  return (
    <div>
      <Cabecalho
        eyebrow="Inspeção de campo"
        titulo="Checklist diário"
        descricao="Preencha no setor, pelo celular. O indicador no dashboard sobe assim que você registra."
      />
      <ChecklistForm />
    </div>
  );
}
