// ============================================================
// cart.js — Estado y lógica del carrito.
// Único responsable: QUÉ hay en el carrito (no cómo se ve).
//
// Una LÍNEA del carrito:
//   { key, id, cant, opciones, nombre, precio, imagen }
//
//   key       identidad de la línea (id + opciones elegidas)
//   opciones  { talle: "M · 17cm", fecha: "1990-05-12", ... }
//   nombre/precio/imagen  copia del catálogo (ver refrescar())
//
// Vive en localStorage, así el pedido sobrevive a recargas y
// viaja entre las páginas del sitio.
// ============================================================

import { imagenPrincipal, claveDe } from "./producto.js";

const STORAGE_KEY = "runarka_cart";

function leer() {
  try {
    const guardado = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return {
      items: Array.isArray(guardado?.items) ? guardado.items : [],
      cliente: { nombre: guardado?.cliente?.nombre || "" },
      comentarios: guardado?.comentarios || "",
    };
  } catch {
    // sin localStorage: arranca vacío
    return { items: [], cliente: { nombre: "" }, comentarios: "" };
  }
}

function guardar(estado) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(estado)); }
  catch { /* sin persistencia: igual funciona en la sesión */ }
}

export function crearCarrito() {
  let estado = leer();
  const subs = new Set();                  // funciones que se avisan al cambiar

  const emitir = () => { guardar(estado); subs.forEach((fn) => fn(api)); };
  const buscar = (key) => estado.items.find((l) => l.key === key);

  const api = {
    suscribir(fn) { subs.add(fn); return () => subs.delete(fn); },

    // --- Ítems ---------------------------------------------
    // linea viene de producto.js → aLinea(producto, opciones)
    agregar(linea, cant = 1) {
      const key = claveDe(linea.id, linea.opciones);
      const existente = buscar(key);
      if (existente) existente.cant += cant;
      else estado.items.push({ ...linea, key, cant });
      emitir();
    },

    fijar(key, cant) {
      const l = buscar(key);
      if (!l) return;
      if (cant <= 0) estado.items = estado.items.filter((x) => x.key !== key);
      else l.cant = cant;
      emitir();
    },

    quitar(key) {
      estado.items = estado.items.filter((l) => l.key !== key);
      emitir();
    },

    // El botón "Vaciar carrito" es la ÚNICA forma de limpiar el pedido:
    // no se vacía solo al enviar, por si el link de WhatsApp no abrió y
    // hay que reintentar. El nombre se conserva (es del cliente, no del pedido).
    vaciar() {
      estado.items = [];
      estado.comentarios = "";
      emitir();
    },

    // --- Sincronizar con el catálogo -----------------------
    // Se llama solo en las páginas que cargaron productos.json.
    // Corrige precios y nombres que hayan cambiado desde que la
    // persona agregó el producto. Si un producto ya no existe,
    // la línea se deja como está (mejor eso que romper el pedido).
    refrescar(productosPorId = {}) {
      let cambio = false;
      estado.items.forEach((l) => {
        const p = productosPorId[l.id];
        if (!p) return;
        const precio = Number(p.precio) || 0;
        const imagen = imagenPrincipal(p);
        if (l.precio !== precio) { l.precio = precio; cambio = true; }
        if (l.nombre !== p.nombre) { l.nombre = p.nombre; cambio = true; }
        if (imagen && l.imagen !== imagen) { l.imagen = imagen; cambio = true; }
      });
      if (cambio) emitir();
    },

    // --- Datos del cliente ---------------------------------
    // Guardan pero NO notifican: si redibujáramos el carrito en cada
    // tecla, el input perdería el foco mientras la persona escribe.
    get nombre() { return estado.cliente.nombre; },
    set nombre(v) { estado.cliente.nombre = v || ""; guardar(estado); },

    get comentarios() { return estado.comentarios; },
    set comentarios(v) { estado.comentarios = v || ""; guardar(estado); },

    // --- Lecturas ------------------------------------------
    get lineas() { return estado.items.map((l) => ({ ...l })); },
    get totalItems() { return estado.items.reduce((a, l) => a + l.cant, 0); },
    get vacio() { return estado.items.length === 0; },

    // Cuántas unidades de un producto hay, sumando todas sus variantes.
    cantidadDe(id) {
      return estado.items.reduce((a, l) => a + (l.id === id ? l.cant : 0), 0);
    },
  };

  return api;
}