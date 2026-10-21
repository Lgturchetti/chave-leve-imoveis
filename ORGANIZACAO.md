# Organização — Chave Leve Imóveis

> Etapa 2 da linha de produção: páginas, painel, dados e interações. Sem cor e sem visual.
> Base: `BRIEFING.md`. Regra herdada: cada informação num lugar só; a página inicial não é sumário.

## Site público
| Página | Endereço | Papel |
|---|---|---|
| Imóveis (início) | `/` | **A busca é a página inicial**, como no Airbnb: barra de busca, fileira de categorias e a grade de imóveis (ou o mapa) |
| Anúncio | `/imovel/[codigo]` | Tudo sobre o imóvel e o botão "Agendar visita" |
| Como funciona | `/como-funciona` | Alugar sem ir até a imobiliária: passo a passo, documentos, garantias (fiador, seguro-fiança, caução), dúvidas |
| Para proprietários | `/proprietarios` | "Anuncie seu imóvel": por que a Chave Leve, como funciona, formulário (vira contato no painel) |
| Favoritos | `/favoritos` | Imóveis marcados com o coração (guardados no aparelho, sem login) |

### Início (`/`)
1. **Barra de busca em pílula**: Onde (bairro ou "Perto da UFSM") · Preço até · Quartos. No celular, um botão
   "Buscar" que abre um painel de baixo com os mesmos campos.
2. **Fileira de categorias** que filtra na hora: Perto da UFSM, Mobiliado, Kitnet, Para dividir, Casa com pátio,
   Aceita pet. O filtro fica no endereço (`/?categoria=mobiliado`) — dá para compartilhar e o "voltar" funciona.
3. **Grade de imóveis** (ou **mapa**, com botão flutuante "Mostrar mapa / Mostrar lista").
   - Cartão: fotos deslizando dentro do cartão (bolinhas), coração, bairro, "a 900 m da UFSM", quartos,
     **aluguel + custo total do mês**.
   - Ordenar: mais recentes, menor preço, mais perto da UFSM.
   - Sem resultado: mensagem com sugestão ("tire o filtro Aceita pet" / "aumente o preço até R$ …").
4. Rodapé com "Como funciona", "Para proprietários", contato e CRECI.

### Anúncio (`/imovel/[codigo]`)
- Grade de fotos (1 grande + 4 pequenas) → **galeria em tela cheia** (deslizar, teclado, fechar arrastando no celular).
- Título, bairro, código, características (quartos, banheiros, área, mobiliado, pet, vaga).
- **Cartão fixo ao rolar** (no celular, barra fixa embaixo): aluguel, condomínio, IPTU, **total por mês**,
  botão **Agendar visita** e WhatsApp com o código do imóvel na mensagem.
- Mapa com a **região aproximada** (círculo, nunca o endereço exato — segurança do proprietário).
- Corretor responsável (foto, nome, CRECI).
- "Parecidos": fileira com imóveis do mesmo bairro/preço.

### Agendar visita
Painel que sobe de baixo (celular) / janela (desktop): escolher **dia** (próximos 7 dias úteis) e **turno**
(manhã/tarde), nome, WhatsApp. Vai para o painel do corretor do imóvel. Sem conta, sem senha.

## Painel (`/painel`, com login)
| Tela | Dono | Corretor |
|---|---|---|
| Entrar (e-mail + senha; "esqueci a senha") | ✔ | ✔ |
| Início: visitas para confirmar, contatos novos, imóveis publicados | tudo | só os seus |
| Imóveis: lista com busca e status (rascunho · disponível · reservado · alugado) | todos | os seus |
| Novo / editar imóvel: dados, custos, categorias, região no mapa, **fotos com arrastar para ordenar** | todos | os seus |
| Visitas: confirmar, remarcar, marcar como feita | todas | as dos seus imóveis |
| Proprietários interessados (formulário do site) | ✔ | — |
| Equipe: convidar corretor, desativar | ✔ | — |

**Conta de demonstração** (portfólio): login público "demo", com dados que **voltam ao original toda noite**,
para o cliente mexer no painel sem estragar nada. **Fotos só de uma biblioteca pronta** (sem upload), textos com
limite de tamanho — nada ofensivo pode aparecer no site público. (Decidido pelo Lorenzo, 20/10/2026.)

## Dados (Supabase)
- `perfis` — nome, papel (dono/corretor), WhatsApp, CRECI, foto, ativo.
- `imoveis` — código, corretor, tipo, bairro, região aproximada (lat/lon + raio), aluguel, condomínio, IPTU,
  quartos, banheiros, área, mobiliado, aceita pet, para dividir, vaga, distância da UFSM, descrição, status, datas.
- `fotos` — imóvel, arquivo (Supabase Storage), ordem, descrição (alt).
- `visitas` — imóvel, nome, WhatsApp, dia, turno, mensagem, status.
- `proprietarios` — nome, contato, endereço do imóvel, mensagem, status.
- **Regras de acesso (RLS)**: público só lê imóveis publicados e suas fotos; público só **cria** visita/contato
  (nunca lê); corretor lê/edita o que é seu; dono tudo. Endereço exato nunca vai para o público.

## Interações (premium, estilo Airbnb)
| Interação | Onde |
|---|---|
| Busca em pílula que se expande | Início |
| Categorias filtrando na hora, com o filtro no endereço | Início |
| Fotos deslizando dentro do cartão + coração com "pulinho" ao favoritar | Cartões |
| Alternar lista ↔ mapa com preço nos pinos | Início |
| Galeria em tela cheia que fecha arrastando | Anúncio |
| Cartão de custo fixo ao rolar | Anúncio |
| Painel de "Agendar visita" que sobe de baixo | Anúncio |
| Fotos arrastáveis para ordenar | Painel |

## Fica de fora (de propósito)
Pagamento online, assinatura de contrato no site (o "contrato digital" é por fora, ex.: gov.br/D4Sign),
chat em tempo real, app. Venda de imóveis.

## Revisão (design-critique, 20/10/2026) — aplicada, etapa 2 aprovada pelo Lorenzo
- Conta demo protegida (acima).
- Cartões carregam só a 1ª foto; as outras quando a pessoa desliza.
- "Agendar visita" deixa claro: "o corretor confirma pelo WhatsApp em até 2 horas" (não é horário garantido).
- Celular: busca vira botão compacto no topo; categorias numa fileira; botão "Mapa" flutuando embaixo.
- Favoritos mantidos, com o aviso "salvos neste aparelho".
