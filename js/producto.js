// ============================================================
// producto.js — Normaliza datos del producto.
// Único responsable: leer el JSON crudo y devolver siempre
// la misma forma, sin importar cómo lo escribió la clienta.
// ============================================================

// --- Imágenes -----------------------------------------------

export function imagenesDe(p) {
  if (Array.isArray(p.imagenes)) return p.imagenes.filter(Boolean);
  return p.imagen ? [p.imagen] : [];
}

export function imagenPrincipal(p) {
  return imagenesDe(p)[0] || "";            // la primera es la "de portada"
}

// --- Opciones ------------------------------------------------
// Un producto sin "opciones" en el JSON se comporta como hasta
// ahora: se agrega al carrito de un toque, sin modal.

export function opcionesDe(p) {
  return Array.isArray(p.opciones) ? p.opciones : [];
}

export function tieneOpciones(p) {
  return opcionesDe(p).length > 0;
}

// --- Línea de carrito ----------------------------------------
// Snapshot: la línea se lleva nombre, precio e imagen puestos,
// así el carrito se dibuja en cualquier página sin cargar el
// catálogo. Cuando el catálogo SÍ está, cart.refrescar() los
// vuelve a sincronizar.

export function aLinea(p, opciones = {}) {
  return {
    id: p.id,
    nombre: p.nombre,
    precio: Number(p.precio) || 0,
    imagen: imagenPrincipal(p),
    opciones,
  };
}

// Identidad de la línea: mismo producto + mismas opciones = misma
// línea (suma cantidad). Distintas opciones = líneas separadas.
export function claveDe(id, opciones = {}) {
  const partes = Object.keys(opciones)
    .filter((k) => opciones[k] !== "" && opciones[k] != null)
    .sort()
    .map((k) => `${k}=${opciones[k]}`);
  return partes.length ? `${id}|${partes.join("|")}` : id;
}