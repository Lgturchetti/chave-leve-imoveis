// Logo: uma chave dentro de um quadrado verde-limão
export function Marca({ tamanho = 30 }: { tamanho?: number }) {
  return (
    <span className="grid shrink-0 place-items-center rounded-[9px] bg-limao" style={{ width: tamanho, height: tamanho }} aria-hidden="true">
      <svg width={tamanho * 0.6} height={tamanho * 0.6} viewBox="0 0 24 24" fill="none" stroke="#0b1220" strokeWidth="2.2" strokeLinecap="round">
        <circle cx="8" cy="12" r="4" />
        <path d="M12 12h9M18 12v3M21 12v2" />
      </svg>
    </span>
  );
}
