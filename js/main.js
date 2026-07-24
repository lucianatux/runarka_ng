// ============================================================
// main.js — Punto de entrada. Lo cargan las 7 páginas.
//
// Cada página inicializa SOLO lo que le corresponde: si no hay
// catálogo en el HTML, el catálogo no se arma. Así una misma
// entrada sirve para todo el sitio sin romperse.
// ============================================================

import "./layout/site-header.js";
import "./layout/site-footer.js";
import { initTema } from "./theme.js";

const $ = (sel) => document.querySelector(sel);

function iniciar() {
  initTema();

  // --- Carrito (paso 3) ---
  // El drawer y el modal de opciones se enganchan acá.

  // --- Catálogo: solo en colecciones.html (paso 3) ---
  if ($("#catalogo-grid")) {
    // cargar productos.json, armar la grilla y los filtros
  }
}

iniciar();
