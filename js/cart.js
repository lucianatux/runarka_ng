// ============================================================
// cart.js — Estado y lógica del carrito.
// Único responsable: QUÉ hay en el carrito (no cómo se ve).
// Guarda en el navegador para que no se pierda al recargar.
// ============================================================

const STORAGE_KEY = "runarka_cart";

function leer() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch { return {}; }                 // si no hay localStorage, arranca vacío
}
function guardar(items) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }
  catch { /* sin persistencia: igual funciona en la sesión */ }
}

export function crearCarrito() {
  let items = leer();                  // { idProducto: cantidad }
  const subs = new Set();              // funciones que se avisan al cambiar

  const emitir = () => { guardar(items); subs.forEach((fn) => fn(api)); };

  const api = {
    suscribir(fn) { subs.add(fn); return () => subs.delete(fn); },

    agregar(id, cant = 1) { items[id] = (items[id] || 0) + cant; emitir(); },
    quitar(id)            { delete items[id]; emitir(); },
    fijar(id, cant)       { cant <= 0 ? delete items[id] : (items[id] = cant); emitir(); },
    vaciar()              { items = {}; emitir(); },

    cantidad(id) { return items[id] || 0; },
    get lineas()    { return Object.entries(items).map(([id, cant]) => ({ id, cant })); },
    get totalItems(){ return Object.values(items).reduce((a, b) => a + b, 0); },
    get vacio()     { return this.totalItems === 0; },
  };
  return api;
}
