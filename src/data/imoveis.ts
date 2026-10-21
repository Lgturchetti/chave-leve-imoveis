// Imóveis FICTÍCIOS de exemplo. Na parte 2 estes dados passam a vir do Supabase
// (mesmo formato: `Imovel`), e listarImoveis()/buscarImovel() mudam por dentro.
import { UFSM } from "@/data/site";

export type Corretor = { id: string; nome: string; creci: string; whatsapp: string; foto?: string };
export type Foto = { url: string; alt: string };
export type TipoImovel = "kitnet" | "studio" | "apartamento" | "casa";
export type Status = "disponivel" | "reservado" | "alugado";

export type Imovel = {
  codigo: string; // ex.: CL-0142 (aparece no anúncio e na mensagem do WhatsApp)
  titulo: string;
  tipo: TipoImovel;
  bairro: string;
  // Região APROXIMADA (nunca o endereço exato no site público)
  regiao: { lat: number; lon: number };
  quartos: number;
  banheiros: number;
  area: number; // m²
  vagas: number;
  mobiliado: boolean;
  aceitaPet: boolean;
  paraDividir: boolean;
  aluguel: number;
  condominio: number;
  iptu: number; // por mês
  descricao: string;
  fotos: Foto[];
  corretor: Corretor;
  status: Status;
  publicadoEm: string; // AAAA-MM-DD
};

export const corretores: Corretor[] = [
  { id: "rafaela", nome: "Rafaela Kunz", creci: "CRECI-RS 00001-F", whatsapp: "5555900000001" },
  { id: "diego", nome: "Diego Martins", creci: "CRECI-RS 00002-F", whatsapp: "5555900000002" },
  { id: "bruna", nome: "Bruna Lopes", creci: "CRECI-RS 00003-F", whatsapp: "5555900000003" },
];
const [rafaela, diego, bruna] = corretores;

const f = (arquivo: string, alt: string): Foto => ({ url: `/fotos/${arquivo}.jpg`, alt });

const base: Imovel[] = [
  {
    codigo: "CL-0142", titulo: "Kitnet mobiliada a 8 min da UFSM", tipo: "kitnet", bairro: "Camobi",
    regiao: { lat: -29.7135, lon: -53.7185 }, quartos: 1, banheiros: 1, area: 28, vagas: 0,
    mobiliado: true, aceitaPet: false, paraDividir: false, aluguel: 950, condominio: 180, iptu: 50,
    descricao: "Kitnet clara com escrivaninha, cama de casal, cozinha americana e janela grande. Prédio com portão eletrônico e lavanderia coletiva.",
    fotos: [f("quarto-estudante", "Quarto com cama e escrivaninha ao lado da janela"), f("studio", "Ambiente integrado com estante e mesa"), f("cozinha", "Cozinha clara com bancada")],
    corretor: rafaela, status: "disponivel", publicadoEm: "2026-10-18",
  },
  {
    codigo: "CL-0137", titulo: "Apartamento 2 quartos para dividir", tipo: "apartamento", bairro: "Camobi",
    regiao: { lat: -29.7092, lon: -53.726 }, quartos: 2, banheiros: 1, area: 58, vagas: 1,
    mobiliado: true, aceitaPet: false, paraDividir: true, aluguel: 1400, condominio: 260, iptu: 60,
    descricao: "Dois quartos de solteiro do mesmo tamanho, sala com mesa de estudos e cozinha completa. Ótimo para dividir com um colega.",
    fotos: [f("dividir", "Quarto com duas camas de solteiro"), f("jantar", "Sala de jantar com janela ampla"), f("sala", "Sala de estar com sofá bege")],
    corretor: rafaela, status: "disponivel", publicadoEm: "2026-10-16",
  },
  {
    codigo: "CL-0151", titulo: "Kitnet perto do RU", tipo: "kitnet", bairro: "Camobi",
    regiao: { lat: -29.716, lon: -53.7215 }, quartos: 1, banheiros: 1, area: 24, vagas: 0,
    mobiliado: false, aceitaPet: false, paraDividir: false, aluguel: 780, condominio: 120, iptu: 35,
    descricao: "Kitnet compacta a poucos minutos do Restaurante Universitário. Sem móveis, com armários na cozinha.",
    fotos: [f("kitnet-2", "Kitnet com cama e sofá"), f("kitnet", "Sala de kitnet com estante"), f("cozinha", "Cozinha com bancada")],
    corretor: diego, status: "disponivel", publicadoEm: "2026-10-20",
  },
  {
    codigo: "CL-0128", titulo: "Studio com escrivaninha", tipo: "studio", bairro: "Camobi",
    regiao: { lat: -29.7055, lon: -53.733 }, quartos: 1, banheiros: 1, area: 32, vagas: 1,
    mobiliado: true, aceitaPet: true, paraDividir: false, aluguel: 1050, condominio: 200, iptu: 45,
    descricao: "Studio mobiliado com área de estudo, cama de casal e varanda. Aceita animal de pequeno porte.",
    fotos: [f("studio", "Studio com estante e mesa"), f("studio-2", "Studio com sofá e cozinha integrada"), f("quarto-estudante", "Canto de estudo")],
    corretor: diego, status: "disponivel", publicadoEm: "2026-10-12",
  },
  {
    codigo: "CL-0133", titulo: "Apartamento 3 quartos para república", tipo: "apartamento", bairro: "Camobi",
    regiao: { lat: -29.7038, lon: -53.7395 }, quartos: 3, banheiros: 2, area: 85, vagas: 1,
    mobiliado: false, aceitaPet: true, paraDividir: true, aluguel: 1900, condominio: 280, iptu: 80,
    descricao: "Três quartos e dois banheiros, ideal para república. Sala ampla e área de serviço separada.",
    fotos: [f("jantar", "Sala de jantar com janela grande"), f("dividir", "Quarto com duas camas"), f("quarto", "Quarto com cama de casal")],
    corretor: bruna, status: "disponivel", publicadoEm: "2026-10-10",
  },
  {
    codigo: "CL-0155", titulo: "Kitnet em prédio novo", tipo: "kitnet", bairro: "Camobi",
    regiao: { lat: -29.711, lon: -53.712 }, quartos: 1, banheiros: 1, area: 26, vagas: 0,
    mobiliado: false, aceitaPet: true, paraDividir: false, aluguel: 890, condominio: 150, iptu: 40,
    descricao: "Kitnet em prédio de 2024, com elevador e bicicletário. Aceita pet.",
    fotos: [f("predio", "Fachada de prédio com sacadas"), f("kitnet", "Kitnet com estante"), f("studio-2", "Ambiente integrado")],
    corretor: rafaela, status: "reservado", publicadoEm: "2026-10-19",
  },
  {
    codigo: "CL-0119", titulo: "Apartamento 2 quartos no Centro", tipo: "apartamento", bairro: "Centro",
    regiao: { lat: -29.6868, lon: -53.807 }, quartos: 2, banheiros: 1, area: 72, vagas: 1,
    mobiliado: false, aceitaPet: false, paraDividir: false, aluguel: 1650, condominio: 320, iptu: 70,
    descricao: "Apartamento amplo perto da Praça Saldanha Marinho, com sacada e garagem.",
    fotos: [f("sala-4", "Sala com sofá e mesa de centro"), f("quarto", "Quarto de casal"), f("cozinha", "Cozinha planejada")],
    corretor: bruna, status: "disponivel", publicadoEm: "2026-10-14",
  },
  {
    codigo: "CL-0110", titulo: "Apartamento com sacada", tipo: "apartamento", bairro: "Centro",
    regiao: { lat: -29.684, lon: -53.8115 }, quartos: 1, banheiros: 1, area: 48, vagas: 0,
    mobiliado: true, aceitaPet: false, paraDividir: false, aluguel: 1150, condominio: 230, iptu: 55,
    descricao: "Um quarto, mobiliado, com sacada e muita luz. Perto de mercados e linhas de ônibus para a UFSM.",
    fotos: [f("sala-amarela", "Sala com sofá amarelo"), f("quarto", "Quarto com janela"), f("predio-3", "Fachada de prédio com janelas")],
    corretor: diego, status: "disponivel", publicadoEm: "2026-10-08",
  },
  {
    codigo: "CL-0145", titulo: "Casa com pátio", tipo: "casa", bairro: "Nossa Senhora de Lourdes",
    regiao: { lat: -29.6935, lon: -53.7975 }, quartos: 3, banheiros: 2, area: 110, vagas: 2,
    mobiliado: false, aceitaPet: true, paraDividir: false, aluguel: 2100, condominio: 0, iptu: 160,
    descricao: "Casa com pátio gramado, churrasqueira e garagem para dois carros. Rua tranquila.",
    fotos: [f("casa-patio", "Casa com varanda e árvore na frente"), f("sala-amarela", "Sala com sofá amarelo"), f("jantar", "Sala de jantar")],
    corretor: bruna, status: "disponivel", publicadoEm: "2026-10-05",
  },
  {
    codigo: "CL-0102", titulo: "Casa 2 quartos na Medianeira", tipo: "casa", bairro: "Medianeira",
    regiao: { lat: -29.7005, lon: -53.8105 }, quartos: 2, banheiros: 1, area: 90, vagas: 1,
    mobiliado: false, aceitaPet: true, paraDividir: false, aluguel: 1500, condominio: 0, iptu: 110,
    descricao: "Casa térrea com pátio nos fundos, perto de escolas e do comércio do bairro.",
    fotos: [f("casa-patio", "Casa com varanda"), f("sala-2", "Sala de estar com escada"), f("cozinha", "Cozinha")],
    corretor: rafaela, status: "disponivel", publicadoEm: "2026-09-30",
  },
  {
    codigo: "CL-0158", titulo: "Studio mobiliado no Bonfim", tipo: "studio", bairro: "Bonfim",
    regiao: { lat: -29.6905, lon: -53.8165 }, quartos: 1, banheiros: 1, area: 30, vagas: 0,
    mobiliado: true, aceitaPet: false, paraDividir: false, aluguel: 980, condominio: 190, iptu: 45,
    descricao: "Studio novo e mobiliado, perto do Calçadão. Ônibus para a UFSM na esquina.",
    fotos: [f("studio-2", "Studio com sofá e cozinha"), f("sala-3", "Sala com poltronas"), f("predio-2", "Fachada do prédio")],
    corretor: diego, status: "disponivel", publicadoEm: "2026-10-17",
  },
  {
    codigo: "CL-0161", titulo: "Apartamento 2 quartos perto da UFSM", tipo: "apartamento", bairro: "Camobi",
    regiao: { lat: -29.7195, lon: -53.7105 }, quartos: 2, banheiros: 1, area: 60, vagas: 1,
    mobiliado: false, aceitaPet: false, paraDividir: true, aluguel: 1300, condominio: 240, iptu: 60,
    descricao: "Dois quartos a 10 minutos a pé do campus, com sacada e churrasqueira.",
    fotos: [f("sala-2", "Sala integrada"), f("dividir", "Quarto com duas camas"), f("cozinha", "Cozinha")],
    corretor: bruna, status: "disponivel", publicadoEm: "2026-10-21",
  },
];

// Distância em linha reta até a UFSM (km) e minutos a pé (andando por ruas ≈ 1,3× a linha reta, 5 km/h)
function km(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const r = (g: number) => (g * Math.PI) / 180;
  const dLat = r(b.lat - a.lat);
  const dLon = r(b.lon - a.lon);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(x));
}

export type Categoria = "perto-ufsm" | "mobiliado" | "kitnet" | "dividir" | "patio" | "pet";
export type ImovelCompleto = Imovel & { total: number; kmUfsm: number; minUfsm: number; categorias: Categoria[] };

export function completar(m: Imovel): ImovelCompleto {
  const kmUfsm = km(m.regiao, UFSM);
  const minUfsm = Math.max(3, Math.round(kmUfsm * 1.3 * 12));
  const categorias: Categoria[] = [];
  if (minUfsm <= 20) categorias.push("perto-ufsm");
  if (m.mobiliado) categorias.push("mobiliado");
  if (m.tipo === "kitnet" || m.tipo === "studio") categorias.push("kitnet");
  if (m.paraDividir) categorias.push("dividir");
  if (m.tipo === "casa") categorias.push("patio");
  if (m.aceitaPet) categorias.push("pet");
  return { ...m, total: m.aluguel + m.condominio + m.iptu, kmUfsm, minUfsm, categorias };
}

// Só o que aparece no site público (alugados ficam de fora; reservados aparecem com aviso)
export async function listarImoveis(): Promise<ImovelCompleto[]> {
  return base
    .filter((m) => m.status !== "alugado")
    .map(completar)
    .sort((a, b) => b.publicadoEm.localeCompare(a.publicadoEm));
}

export async function buscarImovel(codigo: string): Promise<ImovelCompleto | null> {
  const m = base.find((x) => x.codigo.toLowerCase() === codigo.toLowerCase() && x.status !== "alugado");
  return m ? completar(m) : null;
}
