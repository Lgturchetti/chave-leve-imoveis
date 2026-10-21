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

## Conta de demonstração (parte 4)
- `migrations/0004_demo.sql`: papel **demo** ("Visitante"). Vê e mexe em imóveis, fotos, visitas e proprietários como o dono, com travas no banco:
  - fotos só da biblioteca `exemplo/` (lista em `private.foto_da_biblioteca` e em `src/data/biblioteca.ts`, mudar nos dois); nada no armazenamento;
  - imóvel só para corretor que aparece no site; não mexe em perfis/equipe;
  - links e palavrões barrados (`private.texto_proibido`, erro `CLB01`); até 10 imóveis novos por dia (`CLL01`); 15 fotos por imóvel para todos (`CLL02`).
- `functions/demo`: entrada sem senha (gera link de uso único sem mandar e-mail; o site troca pelo login). Cria o login `visitante@example.com` + perfil na 1ª vez. `verify_jwt` desligado de propósito (é pública).
- **Limpeza toda noite às 3h (Brasília)**: `pg_cron` roda `private.restaurar_demo()`, que apaga imóveis, fotos, visitas e proprietários e copia de volta de `private.demo_*` (cópia tirada em 21/10/2026), com as datas andando junto com o calendário. Vale para o banco inteiro, inclusive o que a dona de teste mudar. Equipe e logins não são tocados.
- Rodar a limpeza na mão (SQL Editor): `select private.restaurar_demo();`
- Mudar os dados originais: ajustar pelo painel como dona e tirar cópia nova (`truncate private.demo_imoveis; insert into private.demo_imoveis select * from public.imoveis;` e igual para fotos, visitas e proprietários; atualizar `private.demo_base` com a data do dia).
- Arquivos que a dona enviar não são apagados pela limpeza (o Supabase não deixa apagar arquivo pelo SQL); só sobram soltos no armazenamento.
- O site guarda os imóveis em cache por até 1 hora: depois das 3h, a versão antiga pode aparecer até umas 4h.
- Testado em 21/10/2026: 23 ataques como visitante (todos barrados ou permitidos como esperado), limpeza, dona e corretora sem mudança.

## A fazer no painel do Supabase (pelo Lorenzo, 1 minuto)
- Authentication → Sign In / Providers → desligar **"Allow new users to sign up"** (só o dono cria contas; hoje quem se cadastrasse sozinho não veria nada, mas é melhor fechar a porta).

## Revisão de segurança manual (21/10/2026)
- Cabeçalhos HTTP de segurança no `next.config.ts`; nenhuma chave secreta no site; `.env*` e `ACESSOS.local.md` fora do Git; nenhum HTML vindo do usuário renderizado sem escape.
- Toda ação do painel confere o login (`exigirSessao`) e o banco confere de novo (RLS). Ações públicas validam no servidor, com campo-armadilha e tempo mínimo.
- **Riscos que ficam (aceitos no portfólio):** (1) alguém pode criar pedidos direto pela API do Supabase com a chave pública, pulando a armadilha — a limpeza das 3h apaga; em site de cliente, pensar em Cloudflare Turnstile. (2) A função `demo` é pública (é a ideia); cada chamada só gera um link de uso único.
- **Privacidade da demo:** os formulários públicos avisam, antes do envio, que o pedido aparece num painel aberto a visitantes (em site de cliente, voltar a frase original que está no comentário do código).
- **Na Vercel:** regra de firewall como a da clínica — POST em `/imovel/*`, `/proprietarios` e `/painel/entrar` → limite de 5 por minuto por IP.
- Falta: o Lorenzo rodar `/security-review` numa sessão aberta dentro de `~/projetos/imobiliaria`, e o Strix (pesquisar custo antes).

## /security-review (21/10/2026)
Rodado numa cópia temporária com base vazia (o comando só revisa o que difere do GitHub). **Nenhuma vulnerabilidade.** Único ponto levantado e descartado como intencional: o visitante da demo lê pedidos, contatos e endereços (dados de exemplo, aviso antes do envio, limpeza às 3h).
**Antes de reaproveitar este projeto para um cliente real:** remover a demo (função `demo`, perfil e login `visitante@example.com`, políticas e travas da `0004_demo.sql`, agenda `restaurar-demo` no pg_cron, botão "Ver o painel como visitante") e voltar as frases dos formulários que estão nos comentários.
