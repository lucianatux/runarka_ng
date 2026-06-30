// ============================================================
// data.js — Capa de datos.
// Único responsable: traer la info de productos.json.
// ============================================================

export async function cargarTienda(url = "productos.json") {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`No se pudo cargar ${url} (HTTP ${res.status})`);
  return res.json();
}
