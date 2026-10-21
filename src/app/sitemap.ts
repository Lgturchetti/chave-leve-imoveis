import type { MetadataRoute } from "next";
import { listarImoveis } from "@/data/imoveis";
import { site } from "@/data/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const imoveis = await listarImoveis();
  return [
    { url: site.url, priority: 1 },
    { url: `${site.url}/como-funciona`, priority: 0.6 },
    { url: `${site.url}/proprietarios`, priority: 0.6 },
    ...imoveis.map((m) => ({ url: `${site.url}/imovel/${m.codigo}`, lastModified: m.publicadoEm, priority: 0.8 })),
  ];
}
