// ============================================================
// main.js — Punto de entrada. Lo cargan las 7 páginas.
//
// Cada página inicializa SOLO lo que le corresponde: si no hay
// grilla de catálogo en el HTML, el catálogo no se arma.
// ============================================================

import "./layout/site-header.js";
import "./layout/site-footer.js";
import "./layout/cart-drawer.js";

import { cargarTienda } from "./data.js";
import { crearCarrito } from "./cart.js";
import { crearCatalogo } from "./catalog.view.js";
import { aLinea, tieneOpciones } from "./producto.js";
import { initTema } from "./theme.js";
import { pedirOpciones } from "./ui/modal-opciones.js";
import { toast } from "./ui/toast.js";

const $ = (sel) => document.querySelector(sel);

async function iniciar() {
  initTema();

  // 1) El carrito arranca desde localStorage: se dibuja YA, sin
  //    esperar a la red. Cada línea trae su nombre y su precio.
  const carrito = crearCarrito();
  const drawer = $("cart-drawer");
  drawer?.conectar({ carrito, tienda: {} });

  // 2) productos.json trae la configuración de la tienda (número de
  //    WhatsApp, moneda) y sirve para refrescar precios viejos.
  let data;
  try {
    data = await cargarTienda("productos.json");
  } catch (e) {
    console.error(e);
    if ($("#catalogo-grid")) {
      $("#catalogo-grid").innerHTML =
        `<p class="cart__empty">No pudimos cargar los productos.<br>
         Revisá que <b>productos.json</b> exista y no tenga errores de formato.</p>`;
    }
    return;                       // el carrito sigue usable con lo guardado
  }

  const { tienda = {}, categorias = [], productos = [] } = data;
  const productosPorId = Object.fromEntries(productos.map((p) => [p.id, p]));

  drawer?.conectar({ carrito, tienda });
  carrito.refrescar(productosPorId);   // corrige precios que hayan cambiado

  // 3) Catálogo: solo en colecciones.html
  const grid = $("#catalogo-grid");
  if (grid) {
    const catalogo = crearCatalogo({
      grid, filtros: $("#catalogo-filtros"),
      tienda, productos,
      onAgregar: async (p) => {
        // Sin opciones se agrega directo; con opciones, primero el modal.
        const opciones = tieneOpciones(p) ? await pedirOpciones(p, tienda) : {};
        if (opciones === null) return;             // canceló
        carrito.agregar(aLinea(p, opciones));
        toast(`${p.nombre} · agregado al pedido`);
      },
    });
    catalogo.renderFiltros(categorias);
    catalogo.render();
  }

  // 4) Link de WhatsApp de la página de Contacto
  const contactoWa = $("#contacto-wa");
  if (contactoWa && tienda.whatsapp) {
    contactoWa.href = `https://wa.me/${tienda.whatsapp}`;
  }
}

iniciar();
