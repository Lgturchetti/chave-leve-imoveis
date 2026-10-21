// Biblioteca de fotos da conta de demonstração: o visitante só escolhe daqui (não envia arquivo).
// A mesma lista está no banco (private.foto_da_biblioteca, migração 0004_demo.sql): mudar nos dois.
export const BIBLIOTECA = [
  { caminho: "exemplo/quarto-estudante.jpg", alt: "Quarto com cama e escrivaninha" },
  { caminho: "exemplo/studio.jpg", alt: "Studio com estante e mesa" },
  { caminho: "exemplo/studio-2.jpg", alt: "Studio com sofá e cozinha integrada" },
  { caminho: "exemplo/kitnet.jpg", alt: "Sala de kitnet com estante" },
  { caminho: "exemplo/kitnet-2.jpg", alt: "Kitnet com cama e sofá" },
  { caminho: "exemplo/quarto.jpg", alt: "Quarto com cama de casal" },
  { caminho: "exemplo/dividir.jpg", alt: "Quarto com duas camas de solteiro" },
  { caminho: "exemplo/cozinha.jpg", alt: "Cozinha clara com bancada" },
  { caminho: "exemplo/jantar.jpg", alt: "Sala de jantar com janela ampla" },
  { caminho: "exemplo/sala.jpg", alt: "Sala de estar com sofá bege" },
  { caminho: "exemplo/sala-2.jpg", alt: "Sala de estar iluminada" },
  { caminho: "exemplo/sala-3.jpg", alt: "Sala com poltronas" },
  { caminho: "exemplo/sala-4.jpg", alt: "Sala com plantas e sofá" },
  { caminho: "exemplo/sala-amarela.jpg", alt: "Sala com parede amarela" },
  { caminho: "exemplo/casa-patio.jpg", alt: "Casa com pátio" },
  { caminho: "exemplo/predio.jpg", alt: "Fachada do prédio" },
  { caminho: "exemplo/predio-2.jpg", alt: "Fachada de prédio residencial" },
  { caminho: "exemplo/predio-3.jpg", alt: "Prédio visto da rua" },
] as const;

export const naBiblioteca = (caminho: string) => BIBLIOTECA.some((f) => f.caminho === caminho);
