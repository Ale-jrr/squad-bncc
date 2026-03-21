# MVP Web BNCC Inclusivo

## Status
Implementado:
- Schema universal de atividade
- API `POST /api/generate`
- Formulario de geracao
- Preview A4 imprimivel
- Botao `Imprimir / Baixar PDF`
- Validacao local + validacao de API com detalhamento de erro
- Historico local (ultimas 10 geracoes) com reuso de item
- Melhorias de acessibilidade (labels, foco visivel, aria-invalid, live region)
- Matriz BNCC base (1o ao 5o ano, componentes principais) com sugestao automatica
- Motor de adaptacao por perfil atipico e escalonamento por nivel de suporte

## Rodar local
```bash
cd mvp-web
npm install
npm run dev
```

## Integracao OpenAI (S13)
1. Crie um arquivo `.env.local` na pasta `mvp-web`.
2. Configure:

```bash
OPENAI_API_KEY=sua_chave_aqui
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=700
```

### Controle de custo
- `OPENAI_MAX_TOKENS` limita o tamanho da resposta por requisicao.
- Se `OPENAI_API_KEY` estiver ausente, ou se a chamada falhar, a API usa fallback local automaticamente.

## Base BNCC oficial (PDF)
Para regenerar o indice local de codigos/habilidades a partir do PDF oficial:

```bash
npm run bncc:extract -- "C:\Users\Mayk\squad-bncc\PDF BNCC\BNCC_EI_EF_110518_versaofinal_site.pdf"
```

Saida gerada em `data/bncc-index.json`.

## Como gerar PDF
1. Gerar atividade.
2. Clicar em `Imprimir / Baixar PDF`.
3. No dialogo do navegador, escolher `Salvar como PDF`.

## Proximo passo
- Persistir historico por aluno em banco
- Expandir matriz BNCC para todos os anos/componentes
