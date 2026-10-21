# Banco de dados (Supabase)

Projeto **chave-leve** (org "Lorenzo's team", região São Paulo, plano grátis). ID `lrfoxwbfccjlmjyehjmr`.

- `migrations/0001_esquema.sql`: tabelas, regras de acesso (RLS) e o bucket `fotos`. Já aplicado.
- `semente.sql`: 20 imóveis fictícios (19 públicos + 1 alugado, que fica escondido), equipe e fotos. Já aplicado.
- `fotos-exemplo/`: as 18 fotos de exemplo, enviadas para `fotos/exemplo/` no armazenamento.

## O que o público (visitante do site) pode fazer
| Tabela | Ler | Criar | Alterar/apagar |
|---|---|---|---|
| imoveis | só publicados (disponível/reservado), **sem o endereço** | — | — |
| fotos | só de imóveis publicados | — | — |
| perfis | nome, CRECI, WhatsApp e foto da equipe ativa | — | — |
| visitas | — | sim (dia entre hoje e +14, imóvel publicado) | — |
| proprietarios | — | sim | — |
| armazenamento (fotos) | sim (URL pública) | — | — |

Testado em 21/10/2026 (16 casos com a chave pública) e verificador de segurança do Supabase sem alertas.
A equipe (login) ganha acesso na parte 3 (painel).

## No site
Variáveis em `.env.local` (não vai para o Git) e, na Vercel, em Settings → Environment Variables:
`NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (chave publicável, não é segredo).
Os imóveis ficam em cache por até 1 hora (tag `imoveis`); o painel vai limpar o cache ao salvar.
