// ============================================================
// data.js — Capa de datos.
// Único responsable: traer la info de productos.json.
// ============================================================

// Cargador genérico: sirve para productos.json y contenido.json.
export async function cargarJSON(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`No se pudo cargar ${url} (HTTP ${res.status})`);
  return res.json();
}

export async function cargarTienda(url = "productos.json") {
  return cargarJSON(url);
}