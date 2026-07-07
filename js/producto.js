// ============================================================
// producto.js — Normaliza datos del producto.
// Único responsable: dar SIEMPRE una lista de imágenes,
// sin importar si el JSON trae "imagen" (una) o "imagenes" (varias).
// ============================================================

export function imagenesDe(p) {
  if (Array.isArray(p.imagenes)) return p.imagenes.filter(Boolean);
  return p.imagen ? [p.imagen] : [];        // compatible con el formato viejo
}

export function imagenPrincipal(p) {
  return imagenesDe(p)[0] || "";            // la primera es la "de portada"
}
