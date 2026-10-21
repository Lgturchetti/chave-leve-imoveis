# Briefing — Imobiliária (3º site de portfólio, pacote "Com painel")

> Etapa 1 da linha de produção (briefing + referências). Imobiliária FICTÍCIA em Santa Maria/RS.
> Nome: **Chave Leve Imóveis** (escolhido pelo Lorenzo, 20/10/2026). Etapa 1 aprovada.

## O negócio
- Imobiliária pequena de **aluguel** (apartamentos, casas, kitnets), com **destaque estudantil**:
  imóveis perto da UFSM, mobiliados, para dividir com colegas.
- Diferencial (aprovado): **alugar sem ir até a imobiliária** — fotos de verdade, tudo explicado,
  visita agendada pelo site e contrato digital.

## Para quem
1. **Estudantes da UFSM** (e os pais, que muitas vezes pagam): procuram pelo celular, comparam rápido,
   querem saber distância do campus, se é mobiliado, quanto fica no total (aluguel + condomínio + IPTU).
2. **Famílias e profissionais** que procuram apartamento ou casa.

## O que o site precisa fazer
1. Achar o imóvel certo em segundos: filtros rápidos (bairro, preço, quartos, mobiliado, perto da UFSM).
2. Mostrar o imóvel com fotos grandes e o **custo total por mês** sem surpresa.
3. Levar ao contato: **agendar visita** ou WhatsApp com o código do imóvel na mensagem.

## O painel (o motivo do pacote)
- **Dono** (administrador): vê e edita tudo, cadastra corretores.
- **Corretores** (login próprio): cadastram e editam os seus imóveis (fotos, preço, disponível/alugado)
  e veem os contatos/visitas dos seus imóveis.
- Tecnologia: Supabase (banco, login, fotos) com regras de acesso por pessoa (RLS).
- Segurança: primeiro projeto com login e dados de clientes → revisão de segurança + **Strix** (opcional).

## Referências do Lorenzo
**Airbnb** (única referência) — o Lorenzo gosta do **visual e do jeito de usar**.

O que levar do Airbnb:
| No Airbnb | Na imobiliária |
|---|---|
| Barra de busca em "pílula" com campos (onde, quando, quem) que se expande | Busca: bairro ou "perto da UFSM", faixa de preço, quartos |
| Fileira de categorias com ícones que filtra na hora | Categorias: Perto da UFSM, Mobiliado, Kitnet, Para dividir, Casa com pátio, Aceita pet |
| Cartões com várias fotos deslizando dentro do próprio cartão (bolinhas) + coração para favoritar | Igual: fotos no cartão, favoritar sem login (guardado no aparelho) |
| Alternar lista e **mapa com preços nos pinos** | Mapa dos imóveis com o aluguel no pino |
| Página do anúncio: grade de fotos, galeria em tela cheia, cartão de reserva fixo ao rolar | Grade de fotos + cartão fixo com custo total e "Agendar visita" |
| Visual: branco, arredondado, sombras suaves, uma cor de destaque, tipografia limpa | Ponto de partida para a identidade (etapa 3), sem copiar a marca |

## Regras
- Nada de copiar marca, cores exatas ou textos do Airbnb (direito autoral): levar o **padrão de uso**.
- LGPD: contatos e agendamentos são dados pessoais → aviso de privacidade, acesso só de quem precisa.

## Identidade escolhida (etapa 3, 21/10/2026): **Campus**
Quadro comparativo em `identidade/index.html?v=2`.
- Cores: fundo #f3f5f8 · superfície #ffffff · tinta #0b1220 · texto suave #5a6478 · **ação azul elétrico #2b4dff** ·
  **verde-limão #d7f75b** (etiquetas e destaques, sempre com texto escuro) · coração #e5484d.
- Fontes: **Sora** (títulos, 600) + **Hanken Grotesk** (texto).
- Forma: bem arredondado (cartões 22px, fotos 18px), botões em pílula, sombra suave azulada.
- Clima: jovem, de app, fala direto com o estudante (cuidar para não afastar famílias: textos claros e sóbrios).

## Busca escolhida (etapa 4, 21/10/2026): **Grade + Mapa**
Protótipos em `prototipos/busca.html` (Grade, Mapa, Distância, Um por vez).
- Tela inicial = **Grade** (título, busca em pílula, categorias, grade de cartões com fotos deslizando e coração).
- Botão flutuante **"Mostrar mapa"** abre a versão **Mapa**: desktop = lista ao lado do mapa; celular = mapa em tela
  cheia com a lista numa **gaveta arrastável** (peteleco abre/fecha). Pino mostra o custo total; UFSM marcada.
- Anúncio e "Agendar visita" como no protótipo (custo total, barra fixa no celular, dia + turno).
- Lição do teste: fundo/janela fechados não podem bloquear cliques (pointer-events/visibility).
