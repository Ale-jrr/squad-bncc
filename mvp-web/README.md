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

## Rodar local
```bash
cd mvp-web
npm install
npm run dev
```

## Como gerar PDF
1. Gerar atividade.
2. Clicar em `Imprimir / Baixar PDF`.
3. No dialogo do navegador, escolher `Salvar como PDF`.

## Proximo passo
- Integrar OpenAI para geracao por componente BNCC
- Persistir historico por aluno em banco
