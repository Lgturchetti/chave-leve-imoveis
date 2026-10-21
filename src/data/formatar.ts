import type { Categoria, ImovelCompleto } from "@/data/imoveis";

const moeda = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });
export const brl = (n: number) => moeda.format(n);

export function distanciaUfsm(m: ImovelCompleto) {
  if (m.minUfsm <= 25) return `${m.minUfsm} min a pé da UFSM`;
  return `${m.kmUfsm.toFixed(1).replace(".", ",")} km da UFSM`;
}

export function etiquetaPrincipal(m: ImovelCompleto) {
  if (m.categorias.includes("perto-ufsm")) return "Perto da UFSM";
  if (m.categorias.includes("dividir")) return "Para dividir";
  if (m.categorias.includes("pet")) return "Aceita pet";
  return "";
}

export const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;

// Categorias da fileira (filtram na hora; o filtro fica no endereço)
export const categorias: { id: Categoria | "todos"; nome: string; icone: string }[] = [
  { id: "todos", nome: "Todos", icone: '<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>' },
  { id: "perto-ufsm", nome: "Perto da UFSM", icone: '<path d="M3 10 12 5l9 5-9 5-9-5Z"/><path d="M7 12v4c3 2 7 2 10 0v-4"/>' },
  { id: "mobiliado", nome: "Mobiliado", icone: '<path d="M4 18v-6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6M2 18h20M6 10V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3"/>' },
  { id: "kitnet", nome: "Kitnet e studio", icone: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 12h16M12 4v8"/>' },
  { id: "dividir", nome: "Para dividir", icone: '<circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><path d="M3 19c0-3 2-5 5-5s5 2 5 5M11 19c0-3 2-5 5-5s5 2 5 5"/>' },
  { id: "patio", nome: "Casa com pátio", icone: '<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/><path d="M9 20v-5h6v5"/>' },
  { id: "pet", nome: "Aceita pet", icone: '<circle cx="7" cy="9" r="2"/><circle cx="12" cy="6" r="2"/><circle cx="17" cy="9" r="2"/><path d="M8 17c0-3 2-5 4-5s4 2 4 5c0 2-2 2-4 2s-4 0-4-2Z"/>' },
];
