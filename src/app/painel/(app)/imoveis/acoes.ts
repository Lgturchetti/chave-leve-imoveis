"use server";

// Ações do painel para imóveis e fotos. Cada uma confere o login de novo (exigirSessao);
// o banco (RLS) garante que o corretor só mexe no que é dele.
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { exigirSessao } from "@/lib/painel";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const TIPOS = ["kitnet", "studio", "apartamento", "casa"] as const;
const STATUS = ["rascunho", "disponivel", "reservado", "alugado"] as const;
const MAX_FOTOS = 15;

// Avisa o site público que os imóveis mudaram. Na prática, a 1ª visita depois da mudança ainda pode
// ver a versão de segundos atrás (o Next atualiza em segundo plano); a seguinte já vem nova.
// Anúncio recém-publicado aparece na hora (cache por código em data/imoveis.ts).
const atualizarSite = () => revalidateTag("imoveis", { expire: 0 });

export type CampoImovel =
  | "titulo" | "tipo" | "bairro" | "endereco" | "regiao" | "quartos" | "banheiros" | "area" | "vagas"
  | "aluguel" | "condominio" | "iptu" | "descricao" | "status" | "corretor_id";
export type EstadoImovel = { status: "inicial" | "erro" | "salvo"; erros?: Partial<Record<CampoImovel, string>>; mensagem?: string };

const texto = (fd: FormData, c: string, max: number) => {
  const v = fd.get(c);
  return typeof v === "string" ? v.trim().replace(/\s+/g, " ").slice(0, max) : "";
};
const textoLongo = (fd: FormData, c: string, max: number) => {
  const v = fd.get(c);
  return typeof v === "string" ? v.trim().replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").slice(0, max) : "";
};
const inteiro = (fd: FormData, c: string) => {
  const v = String(fd.get(c) ?? "").replace(/[^\d]/g, "");
  return v === "" ? NaN : Number(v);
};
const numero = (fd: FormData, c: string) => Number(String(fd.get(c) ?? "").replace(",", "."));

export async function salvarImovel(_a: EstadoImovel, fd: FormData): Promise<EstadoImovel> {
  const { supabase, perfil, dono } = await exigirSessao();
  const id = texto(fd, "id", 36);
  if (id && !UUID.test(id)) return { status: "erro", mensagem: "Imóvel inválido. Atualize a página." };

  const d = {
    titulo: texto(fd, "titulo", 70),
    tipo: texto(fd, "tipo", 20) as (typeof TIPOS)[number],
    bairro: texto(fd, "bairro", 40),
    endereco: texto(fd, "endereco", 160) || null,
    lat: numero(fd, "lat"),
    lon: numero(fd, "lon"),
    quartos: inteiro(fd, "quartos"),
    banheiros: inteiro(fd, "banheiros"),
    area: inteiro(fd, "area"),
    vagas: inteiro(fd, "vagas"),
    mobiliado: fd.get("mobiliado") === "on",
    aceita_pet: fd.get("aceita_pet") === "on",
    para_dividir: fd.get("para_dividir") === "on",
    aluguel: inteiro(fd, "aluguel"),
    condominio: inteiro(fd, "condominio") || 0,
    iptu: inteiro(fd, "iptu") || 0,
    descricao: textoLongo(fd, "descricao", 1200),
    status: (id ? texto(fd, "status", 20) : "rascunho") as (typeof STATUS)[number],
    corretor_id: dono ? texto(fd, "corretor_id", 36) : perfil.id,
  };

  const erros: EstadoImovel["erros"] = {};
  if (d.titulo.length < 5) erros.titulo = "Escreva um título com pelo menos 5 letras.";
  if (!TIPOS.includes(d.tipo)) erros.tipo = "Escolha o tipo.";
  if (d.bairro.length < 2) erros.bairro = "Escreva o bairro.";
  if (!(d.lat >= -29.8 && d.lat <= -29.6 && d.lon >= -53.9 && d.lon <= -53.65)) erros.regiao = "Toque no mapa para marcar a região (dentro de Santa Maria).";
  if (!(d.quartos >= 0 && d.quartos <= 10)) erros.quartos = "De 0 a 10.";
  if (!(d.banheiros >= 1 && d.banheiros <= 10)) erros.banheiros = "De 1 a 10.";
  if (!(d.area >= 10 && d.area <= 1000)) erros.area = "Entre 10 e 1000 m².";
  if (!(d.vagas >= 0 && d.vagas <= 10)) erros.vagas = "De 0 a 10.";
  if (!(d.aluguel >= 100 && d.aluguel <= 50000)) erros.aluguel = "Entre R$ 100 e R$ 50.000.";
  if (!(d.condominio >= 0 && d.condominio <= 10000)) erros.condominio = "Até R$ 10.000.";
  if (!(d.iptu >= 0 && d.iptu <= 10000)) erros.iptu = "Até R$ 10.000 por mês.";
  if (d.descricao.length < 20) erros.descricao = "Conte um pouco mais (pelo menos 20 letras).";
  if (!STATUS.includes(d.status)) erros.status = "Escolha a situação.";
  if (!UUID.test(d.corretor_id)) erros.corretor_id = "Escolha o corretor.";
  if (Object.keys(erros).length) return { status: "erro", erros, mensagem: "Confira os campos marcados." };

  const { lat, lon, ...resto } = d;
  const linha = { ...resto, lat: Math.round(lat * 1e5) / 1e5, lon: Math.round(lon * 1e5) / 1e5 };

  if (!id) {
    const { data, error } = await supabase.from("imoveis").insert(linha).select("codigo").single();
    if (error || !data) return { status: "erro", mensagem: "Não foi possível criar o imóvel. Tente de novo." };
    redirect(`/painel/imoveis/${data.codigo}?novo=1`);
  }

  // Edição: publicar exige foto; a data de publicação é a primeira vez que vai ao ar
  const { data: atual } = await supabase.from("imoveis").select("publicado_em, fotos(count)").eq("id", id).maybeSingle();
  if (!atual) return { status: "erro", mensagem: "Imóvel não encontrado ou sem permissão." };
  const publico = d.status === "disponivel" || d.status === "reservado";
  const qtdFotos = (atual.fotos as unknown as { count: number }[])[0]?.count ?? 0;
  if (publico && qtdFotos === 0) return { status: "erro", erros: { status: "Adicione pelo menos uma foto antes de publicar." }, mensagem: "Falta foto para publicar." };

  const { error } = await supabase
    .from("imoveis")
    .update({ ...linha, publicado_em: publico && !atual.publicado_em ? new Date().toISOString() : atual.publicado_em })
    .eq("id", id);
  if (error) return { status: "erro", mensagem: "Não foi possível salvar. Tente de novo." };

  atualizarSite();
  return { status: "salvo", mensagem: publico ? "Salvo. Já está no site." : "Salvo." };
}

export async function apagarImovel(id: string) {
  const { supabase, dono } = await exigirSessao();
  if (!dono || !UUID.test(id)) return { erro: "Só o dono pode apagar imóveis." };
  const { data: arquivos } = await supabase.storage.from("fotos").list(`imoveis/${id}`, { limit: 100 });
  if (arquivos?.length) await supabase.storage.from("fotos").remove(arquivos.map((a) => `imoveis/${id}/${a.name}`));
  const { error } = await supabase.from("imoveis").delete().eq("id", id);
  if (error) return { erro: "Não foi possível apagar." };
  atualizarSite();
  redirect("/painel/imoveis?apagado=1");
}

export type FotoPainel = { id: string; caminho: string; alt: string; ordem: number };

export async function adicionarFoto(imovelId: string, caminho: string, alt: string): Promise<{ foto?: FotoPainel; erro?: string }> {
  const { supabase } = await exigirSessao();
  if (!UUID.test(imovelId) || !new RegExp(`^imoveis/${imovelId}/[0-9a-f-]{36}\\.(webp|jpg|png)$`).test(caminho)) return { erro: "Foto inválida." };
  const { data: fotos } = await supabase.from("fotos").select("ordem").eq("imovel_id", imovelId);
  if ((fotos?.length ?? 0) >= MAX_FOTOS) return { erro: `No máximo ${MAX_FOTOS} fotos por imóvel.` };
  const ordem = Math.max(-1, ...(fotos ?? []).map((f) => f.ordem)) + 1;
  const { data, error } = await supabase
    .from("fotos")
    .insert({ imovel_id: imovelId, caminho, alt: alt.trim().slice(0, 140) || "Foto do imóvel", ordem })
    .select("id, caminho, alt, ordem")
    .single();
  if (error || !data) return { erro: "Não foi possível salvar a foto." };
  atualizarSite();
  return { foto: data };
}

export async function removerFoto(fotoId: string): Promise<{ erro?: string }> {
  const { supabase } = await exigirSessao();
  if (!UUID.test(fotoId)) return { erro: "Foto inválida." };
  const { data: foto } = await supabase.from("fotos").select("id, caminho, imovel_id, imoveis(status)").eq("id", fotoId).maybeSingle();
  if (!foto) return { erro: "Foto não encontrada." };
  const status = (foto.imoveis as unknown as { status: string } | null)?.status;
  if (status === "disponivel" || status === "reservado") {
    const { count } = await supabase.from("fotos").select("id", { count: "exact", head: true }).eq("imovel_id", foto.imovel_id);
    if ((count ?? 0) <= 1) return { erro: "O imóvel está no site: ele precisa de pelo menos uma foto." };
  }
  const { error } = await supabase.from("fotos").delete().eq("id", fotoId);
  if (error) return { erro: "Não foi possível remover." };
  // Só apaga o arquivo se for da equipe (as fotos de exemplo são compartilhadas)
  if (foto.caminho.startsWith("imoveis/")) await supabase.storage.from("fotos").remove([foto.caminho]);
  atualizarSite();
  return {};
}

export async function ordenarFotos(imovelId: string, ids: string[]): Promise<{ erro?: string }> {
  const { supabase } = await exigirSessao();
  if (!UUID.test(imovelId) || ids.length > MAX_FOTOS || !ids.every((i) => UUID.test(i))) return { erro: "Ordem inválida." };
  const resultados = await Promise.all(ids.map((id, ordem) => supabase.from("fotos").update({ ordem }).eq("id", id).eq("imovel_id", imovelId)));
  if (resultados.some((r) => r.error)) return { erro: "Não foi possível salvar a ordem." };
  atualizarSite();
  return {};
}

export async function legendarFoto(fotoId: string, alt: string): Promise<{ erro?: string }> {
  const { supabase } = await exigirSessao();
  const limpo = alt.trim().replace(/\s+/g, " ").slice(0, 140);
  if (!UUID.test(fotoId) || limpo.length < 3) return { erro: "Descreva a foto com pelo menos 3 letras." };
  const { error } = await supabase.from("fotos").update({ alt: limpo }).eq("id", fotoId);
  if (error) return { erro: "Não foi possível salvar a descrição." };
  atualizarSite();
  return {};
}
