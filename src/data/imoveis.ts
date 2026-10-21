// Imóveis vêm do Supabase (tabelas imoveis, fotos e perfis; dados de exemplo em supabase/semente.sql).
// Só o que é público: o endereço exato nunca é lido aqui (o banco nem deixa).
import { cacheLife, cacheTag } from "next/cache";
import { UFSM } from "@/data/site";
import { supabasePublico, urlFoto } from "@/lib/supabase/publico";

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

type Linha = {
  codigo: string; titulo: string; tipo: TipoImovel; bairro: string; lat: number; lon: number;
  quartos: number; banheiros: number; area: number; vagas: number;
  mobiliado: boolean; aceita_pet: boolean; para_dividir: boolean;
  aluguel: number; condominio: number; iptu: number; descricao: string; status: Status; publicado_em: string;
  fotos: { caminho: string; alt: string; ordem: number }[];
  corretor: { id: string; nome: string; creci: string | null; whatsapp: string } | null;
};

const COLUNAS = `codigo, titulo, tipo, bairro, lat, lon, quartos, banheiros, area, vagas, mobiliado, aceita_pet, para_dividir,
  aluguel, condominio, iptu, descricao, status, publicado_em,
  fotos (caminho, alt, ordem), corretor:perfis (id, nome, creci, whatsapp)`;

function converter(l: Linha): Imovel {
  return {
    codigo: l.codigo, titulo: l.titulo, tipo: l.tipo, bairro: l.bairro, regiao: { lat: l.lat, lon: l.lon },
    quartos: l.quartos, banheiros: l.banheiros, area: l.area, vagas: l.vagas,
    mobiliado: l.mobiliado, aceitaPet: l.aceita_pet, paraDividir: l.para_dividir,
    aluguel: l.aluguel, condominio: l.condominio, iptu: l.iptu, descricao: l.descricao,
    fotos: [...l.fotos].sort((a, b) => a.ordem - b.ordem).map((f) => ({ url: urlFoto(f.caminho), alt: f.alt })),
    corretor: { id: l.corretor?.id ?? "", nome: l.corretor?.nome ?? "Equipe Chave Leve", creci: l.corretor?.creci ?? "", whatsapp: l.corretor?.whatsapp ?? "" },
    status: l.status,
    publicadoEm: l.publicado_em.slice(0, 10),
  };
}

// Só o que aparece no site público (o banco já esconde rascunhos e alugados; reservados aparecem com aviso).
// Fica em cache; o painel (parte 3) avisa quando algo mudar (tag "imoveis").
export async function listarImoveis(): Promise<ImovelCompleto[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("imoveis");
  const { data, error } = await supabasePublico
    .from("imoveis")
    .select(COLUNAS)
    .in("status", ["disponivel", "reservado"])
    .order("publicado_em", { ascending: false })
    .returns<Linha[]>();
  if (error) throw new Error(`Supabase: ${error.message}`);
  return data.map((l) => completar(converter(l)));
}

// Um anúncio: cache próprio por código. Um imóvel recém-publicado nunca esteve em cache,
// então aparece já na primeira visita (não depende da lista geral ser atualizada).
export async function buscarImovel(codigo: string): Promise<ImovelCompleto | null> {
  if (!/^CL-\d{4}$/i.test(codigo)) return null;
  return buscarImovelNoBanco(codigo.toUpperCase());
}

async function buscarImovelNoBanco(codigo: string): Promise<ImovelCompleto | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("imoveis", `imovel-${codigo}`);
  const { data, error } = await supabasePublico
    .from("imoveis")
    .select(COLUNAS)
    .eq("codigo", codigo)
    .in("status", ["disponivel", "reservado"])
    .returns<Linha[]>()
    .maybeSingle();
  if (error) throw new Error(`Supabase: ${error.message}`);
  return data ? completar(converter(data as Linha)) : null;
}
