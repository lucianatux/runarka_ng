// ============================================================
// catalog.filters.js — Estado y lógica de filtrado del catálogo.
// Único responsable: decidir QUÉ productos pasan el filtro
// (categoría + emoción + piedra). No dibuja nada: eso es la vista.
// ============================================================

// Saca acentos y pasa a minúsculas: "Energía" matchea "energia".
function normalizar(texto = "") {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// ¿El producto menciona ese término en su NOMBRE o DESCRIPCIÓN?
function menciona(producto, termino) {
  if (!termino) return true; // sin filtro elegido = no descarta nada
  const texto = normalizar(`${producto.nombre} ${producto.descripcion || ""}`);
  return texto.includes(normalizar(termino));
}

export function crearFiltrosCatalogo() {
  let categoria = "todos";
  let emocion = "";
  let piedra = "";

  return {
    setCategoria(id) { categoria = id; },
    setEmocion(v)    { emocion = v; },
    setPiedra(v)     { piedra = v; },

    aplicar(productos) {
      return productos.filter((p) =>
        p.disponible !== false &&
        (categoria === "todos" || p.categoria === categoria) &&
        menciona(p, emocion) &&
        menciona(p, piedra));
    },
  };
}
