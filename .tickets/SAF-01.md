---
id: SAF-01
repo: safetrack-epi
severidade: 🟠
status: feito
dono: devops-senior
origem: achado devops-senior colado direto no prompt (lider-tecnico, 2026-07-29) — "5 Dockerfiles estacionados em infra/docker/, achado 1/5"
depende_de: []
bloqueia: []
---

# Trazer o Dockerfile de produção pra este repo e destravar o build (F-13)

## O problema
`infra/docker/safetrack-epi/Dockerfile` existe há semanas com o cabeçalho "COPY THIS
INTO THE APP REPO" e nunca foi copiado — este repo não tem Dockerfile nenhum. Mesmo que
tivesse, o build falharia: `next.config.ts` é o stub vazio do `create-next-app` e não
declara `output: 'standalone'`, então o estágio de runtime do Dockerfile não teria
`.next/standalone` pra copiar.

A restrição que impedia editar este repo (briefing anterior) foi revogada pelo dono do
portfólio — ver origem.

## Evidência
- `safetrack-epi/next.config.ts:1-5` — stub vazio do `create-next-app`, sem `output`.
- `infra/docker/safetrack-epi/Dockerfile:4` — `# COPY THIS INTO THE APP REPO.`
- `infra/docker/safetrack-epi/Dockerfile:46-47` — `# Requires output: 'standalone' in
  next.config.ts, which is currently the empty create-next-app stub. →
  PRE-MIGRATION-FIXES.md F-13.`
- `infra/docs/PRE-MIGRATION-FIXES.md:34,168-180` — F-13, item da tabela e a seção de
  detalhe: sem `output: 'standalone'` "o build simplesmente falha".
- `infra/stack/oracle/compose.yml:267` — `image: ${REGISTRY}/safetrack-epi:${IMAGE_TAG}`,
  uma imagem que hoje não existe caminho nenhum pra construir.
- `safetrack-epi/package.json:5-11` — usa `npm` (há `package-lock.json`, não
  `pnpm-lock.yaml`), o que já bate com o `npm ci` do Dockerfile de infra.

## Etapas
1. `safetrack-epi/next.config.ts` — trocar o objeto vazio por
   `{ output: 'standalone' }` (mantendo a tipagem `NextConfig` já importada).
2. Copiar `infra/docker/safetrack-epi/Dockerfile` para `safetrack-epi/Dockerfile`,
   removendo apenas as duas linhas de cabeçalho `COPY THIS INTO THE APP REPO` (o resto
   do comentário — a explicação do Lambda Web Adapter, do ADR-0002, do gotcha do
   Host header — fica; é a única documentação que esse Dockerfile tem).
3. Atualizar o comentário da linha que hoje diz `→ PRE-MIGRATION-FIXES.md F-13` para
   refletir que a etapa 1 já resolveu — ex.: `# output: 'standalone' setado em
   next.config.ts (SAF-01).`
4. Criar `safetrack-epi/.dockerignore` (não existe hoje): no mínimo `node_modules`,
   `.next`, `.git`, `.env*`, `*.md`, `.claude`, `.tickets`. Sem isso, `npm run seed`
   dentro do build (etapa do próprio Dockerfile) roda sobre um contexto de build que
   pode incluir segredos locais (`.env.local` existe no repo hoje).
5. Rodar `docker build -t safetrack-epi:local .` na raiz do repo e confirmar que
   completa sem erro.
6. Rodar o container localmente (`docker run -p 3000:3000 safetrack-epi:local`) e
   confirmar `curl -i http://localhost:3000/` devolve 200.

## Definição de pronto
- [x] `safetrack-epi/next.config.ts` exporta `{ output: 'standalone' }`.
- [x] `safetrack-epi/Dockerfile` existe, sem o cabeçalho "COPY THIS INTO THE APP REPO".
- [x] `safetrack-epi/.dockerignore` existe e exclui `.env*`.
- [x] `docker build -t safetrack-epi:local .` termina com exit 0 — saída relevante:
      ```
      #14 [build 5/5] RUN npm run seed && npm run build
      #14 0.518 Seed gerado: 23 entregas, 3 checklists, 3 incidentes, 16 treinamentos
          realizados, 4 modelos de checklist, 2 APRs, 1 LTRs.
      #14 0.798 ▲ Next.js 16.2.10 (Turbopack)
      #14 4.772 ✓ Generating static pages using 11 workers (26/26) in 157ms
      #14 DONE 5.2s
      #19 naming to docker.io/library/safetrack-epi:local done
      ```
- [x] `curl -i http://localhost:3000/` no container rodando devolve `200`:
      `HTTP/1.1 200 OK` (rodado com `docker run -d -p 3000:3000 safetrack-epi:local`,
      container removido após o teste).

## Fora de escopo
- Não apague nem edite `infra/docker/safetrack-epi/Dockerfile`. Esse arquivo em infra
  fica como está até um ticket próprio decidir o destino dele (mesmo padrão do INF-15,
  que resolve isso pro caso do backend do assistant-order-ai; nenhum ticket equivalente
  foi aberto ainda pros outros três Dockerfiles, incluindo este).
- Não configure o Lambda Web Adapter fora do que o Dockerfile copiado já traz — não é
  este ticket que decide se o deploy é Lambda, Fargate ou outra coisa.
- Não mexa em `lib/db.ts` nem no comportamento de fallback do "banco" em memória — o
  comentário do Dockerfile já avisa que é intencional para o demo atual.
- Não crie CI/pipeline de build. Este ticket entrega um Dockerfile que builda local;
  automatizar o build+push é trabalho de infra, não deste repo.

## Não verificado
- **Não abri o Lambda Web Adapter em si** nem confirmei que a versão `0.9.1` pinada no
  Dockerfile de infra ainda é a atual — copiei o pin como está.
- **Não testei o comportamento do Host header** (CloudFront/`Managed-AllViewer`)
  descrito no comentário do Dockerfile — isso só é observável com o CloudFront de pé,
  fora do alcance deste ticket.
- Presumo que `npm run seed && npm run build` (etapa de build do Dockerfile) roda sem
  precisar de nenhuma variável de ambiente hoje ausente do build — não confirmei
  lendo `scripts/seed.ts` linha a linha.
