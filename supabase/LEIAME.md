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

## Equipe e painel (parte 3)
- `migrations/0002_equipe.sql`: acesso de quem faz login. **Dono**: tudo. **Corretor**: só os próprios imóveis, as fotos e as visitas deles; não vê proprietários nem a equipe. Ajudantes em `private` (fora da API).
- `migrations/0003_service_role.sql`: acesso das funções do servidor (necessário porque desligamos as permissões automáticas).
- `functions/equipe`: cria login de corretor com **senha provisória** e gera senha nova. Só o dono; a chave secreta fica dentro do Supabase.
- Fotos da equipe: `fotos/imoveis/<id do imóvel>/<arquivo>.webp` (reduzidas no aparelho para ~1600 px antes de subir). Apagar imóvel apaga os arquivos.
- Testado em 21/10/2026: fluxo completo no navegador (dona e corretora, celular e computador) + 15 ataques direto na API com o login da corretora, todos barrados.
- Aviso do verificador que fica: `senha_trocada()` pode ser chamada por quem tem login — de propósito (só desliga o aviso de senha provisória da própria pessoa).
- Logins de teste: `ACESSOS.local.md` (fora do Git).

## A fazer no painel do Supabase (pelo Lorenzo, 1 minuto)
- Authentication → Sign In / Providers → desligar **"Allow new users to sign up"** (só o dono cria contas; hoje quem se cadastrasse sozinho não veria nada, mas é melhor fechar a porta).
