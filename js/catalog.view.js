// ============================================================
// catalog.view.js — Vista del catálogo.
// Único responsable: dibujar productos y filtros en pantalla.
// ============================================================

import { formatearPrecio } from "./whatsapp.js";
import { imagenesDe } from "./producto.js";

// Placeholder gris para cuando falta una foto (no rompe el diseño)
const IMG_FALLBACK =
  "data:image/svg+xml," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240">' +
    '<rect width="100%" height="100%" fill="#f3ead8"/>' +
    '<text x="50%" y="50%" font-family="serif" font-size="16" fill="#b6a079" ' +
    'text-anchor="middle" dominant-baseline="middle">Runarka</text></svg>');

export function crearCatalogo({ grid, filtros, tienda, productos, onAgregar }) {
  let categoriaActiva = "todos";

  function tarjeta(p) {
    const imgs = imagenesDe(p);
    const fuentes = imgs.length ? imgs : [""];   // al menos una (muestra placeholder)

    // Una <img> por foto, dentro de una pista deslizable
    const slides = fuentes.map((src) =>
      `<img src="${src}" alt="${p.nombre}" loading="lazy"
            onerror="this.onerror=null;this.src='${IMG_FALLBACK}'">`).join("");

    // Puntitos: solo si hay más de una foto
    const dots = imgs.length > 1
      ? `<div class="product__dots">${imgs.map((_, i) =>
          `<button class="product__dot${i ? "" : " is-active"}" aria-label="Foto ${i + 1}"></button>`
        ).join("")}</div>`
      : "";

    const el = document.createElement("article");
    el.className = "panel product";
    el.innerHTML = `
      <div class="product__media">
        <div class="product__track">${slides}</div>
        ${dots}
      </div>
      <div class="product__body">
        <h3 class="product__name">${p.nombre}</h3>
        <p class="product__desc">${p.descripcion || ""}</p>
        <div class="product__foot">
          <span class="product__price">${formatearPrecio(p.precio, tienda.moneda)}</span>
          <button class="btn btn--primary btn--sm">Agregar</button>
        </div>
      </div>`;

    // Galería: sincroniza puntitos <-> deslizado (swipe nativo del navegador)
    if (imgs.length > 1) {
      const track = el.querySelector(".product__track");
      const puntos = [...el.querySelectorAll(".product__dot")];
      puntos.forEach((d, i) => d.addEventListener("click", () =>
        track.scrollTo({ left: i * track.clientWidth, behavior: "smooth" })));
      track.addEventListener("scroll", () => {
        const i = Math.round(track.scrollLeft / track.clientWidth);
        puntos.forEach((d, k) => d.classList.toggle("is-active", k === i));
      }, { passive: true });
    }

    el.querySelector(".product__foot button").addEventListener("click", () => onAgregar(p.id));
    return el;
  }

  function render() {
    const lista = productos.filter((p) =>
      p.disponible !== false &&
      (categoriaActiva === "todos" || p.categoria === categoriaActiva));

    grid.replaceChildren(
      ...(lista.length
        ? lista.map(tarjeta)
        : [Object.assign(document.createElement("p"),
            { className: "muted center", textContent: "No hay productos en esta categoría." })])
    );
  }

  function renderFiltros(categorias = []) {
    const todas = [{ id: "todos", nombre: "Todos" }, ...categorias];
    filtros.replaceChildren(...todas.map((c) => {
      const b = document.createElement("button");
      b.className = "chip" + (c.id === categoriaActiva ? " is-active" : "");
      b.textContent = c.nombre;
      b.addEventListener("click", () => {
        categoriaActiva = c.id;
        [...filtros.children].forEach((x) => x.classList.toggle("is-active", x === b));
        render();
      });
      return b;
    }));
  }

  return { render, renderFiltros };
}
