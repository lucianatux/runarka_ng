// ============================================================
// main.js — Punto de entrada. Conecta todos los módulos.
// Si querés agregar/quitar una "feature", se nota acá.
// ============================================================

import { cargarTienda } from "./data.js";
import { crearCarrito } from "./cart.js";
import { crearCatalogo } from "./catalog.view.js";
import { crearVistaCarrito } from "./cart.view.js";

const $ = (sel) => document.querySelector(sel);

async function iniciar() {
  // 1) Datos
  let data;
  try {
    data = await cargarTienda("productos.json");
  } catch (e) {
    console.error(e);
    $("#catalogo-grid").innerHTML =
      `<p class="cart__empty">No pudimos cargar los productos.<br>
       Revisá que <b>productos.json</b> exista y no tenga errores de formato.</p>`;
    return;
  }

  const { tienda = {}, categorias = [], productos = [] } = data;
  const productosPorId = Object.fromEntries(productos.map((p) => [p.id, p]));

  // 2) Carrito (modelo)
  const carrito = crearCarrito();

  // 3) Vista del carrito
  const vistaCarrito = crearVistaCarrito({
    refs: {
      drawer: $("#cart"), overlay: $("#overlay"), lista: $("#cart-items"),
      totalEl: $("#cart-total"), contador: $("#cart-count"),
      btnCheckout: $("#cart-checkout"), btnVaciar: $("#cart-clear"),
    },
    tienda, productosPorId, carrito,
  });
  carrito.suscribir(() => vistaCarrito.render());

  // 4) Catálogo
  const catalogo = crearCatalogo({
    grid: $("#catalogo-grid"), filtros: $("#catalogo-filtros"),
    tienda, productos,
    onAgregar: (id) => carrito.agregar(id),
  });
  catalogo.renderFiltros(categorias);
  catalogo.render();
  vistaCarrito.render();

  // 5) Eventos de la UI
  $("#cart-open").addEventListener("click", vistaCarrito.abrir);
  $("#cart-close").addEventListener("click", vistaCarrito.cerrar);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") vistaCarrito.cerrar(); });

  // Menú móvil
  const nav = $("#nav");
  $("#nav-toggle").addEventListener("click", () => nav.classList.toggle("is-open"));
  nav.addEventListener("click", (e) => { if (e.target.tagName === "A") nav.classList.remove("is-open"); });

  // Link de WhatsApp en la sección Contacto (usa el número del JSON)
  const contactoWa = $("#contacto-wa");
  if (contactoWa && tienda.whatsapp) contactoWa.href = `https://wa.me/${tienda.whatsapp}`;

  // 6) Modo oscuro (opcional — se puede quitar sin afectar nada)
  const btnTema = $("#theme-toggle");
  if (btnTema) {
    const guardado = (() => { try { return localStorage.getItem("runarka_theme"); } catch { return null; } })();
    if (guardado) document.documentElement.dataset.theme = guardado;
    btnTema.addEventListener("click", () => {
      const html = document.documentElement;
      const nuevo = html.dataset.theme === "dark" ? "" : "dark";
      html.dataset.theme = nuevo;
      try { localStorage.setItem("runarka_theme", nuevo); } catch {}
    });
  }
}

iniciar();
