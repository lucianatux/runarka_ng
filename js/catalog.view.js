// ============================================================
// catalog.view.js — Vista del catálogo.
// Único responsable: dibujar productos y filtros en pantalla.
// No sabe del carrito ni del modal: avisa con onAgregar(producto).
// ============================================================

import { formatearPrecio } from "./whatsapp.js";
import { imagenesDe, tieneOpciones } from "./producto.js";
import { esc } from "./ui/dom.js";

// Placeholder gris para cuando falta una foto (no rompe el diseño)
const IMG_FALLBACK =
  "data:image/svg+xml," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240">' +
    '<rect width="100%" height="100%" fill="#f3ead8"/>' +
    '<text x="50%" y="50%" font-family="serif" font-size="16" fill="#b6a079" ' +
    'text-anchor="middle" dominant-baseline="middle">Runarka</text></svg>');

export function crearCatalogo({ grid, filtros, tienda, productos, onAgregar,
                                filtroExtra }) {
  let categoriaActiva = "todos";

  function tarjeta(p) {
    const imgs = imagenesDe(p);
    const fuentes = imgs.length ? imgs : [""];   // al menos una (muestra placeholder)
    const nombre = esc(p.nombre);

    // Una <img> por foto, dentro de una pista deslizable
    const slides = fuentes.map((src) =>
      `<img src="${esc(src)}" alt="${nombre}" loading="lazy"
            onerror="this.onerror=null;this.src='${IMG_FALLBACK}'">`).join("");

    // Puntitos: solo si hay más de una foto
    const dots = imgs.length > 1
      ? `<div class="product__dots">${imgs.map((_, i) =>
          `<button class="product__dot${i ? "" : " is-active"}" type="button"
                   aria-label="Foto ${i + 1}"></button>`
        ).join("")}</div>`
      : "";

    // Con opciones el botón avisa que viene un formulario.
    const etiquetaBoton = tieneOpciones(p) ? "Personalizar" : "Agregar";

    const el = document.createElement("article");
    el.className = "panel product";
    el.innerHTML = `
      <div class="product__media">
        <div class="product__track">${slides}</div>
        ${dots}
      </div>
      <div class="product__body">
        <h3 class="product__name">${nombre}</h3>
        <p class="product__desc">${esc(p.descripcion || "")}</p>
        <div class="product__foot">
          <span class="product__price">${formatearPrecio(p.precio, tienda.moneda)}</span>
          <button class="btn btn--primary btn--sm" type="button">${etiquetaBoton}</button>
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

    el.querySelector(".product__foot button")
      .addEventListener("click", () => onAgregar(p));
    return el;
  }

  function render() {
    const lista = productos.filter((p) =>
      p.disponible !== false &&
      (categoriaActiva === "todos" || p.categoria === categoriaActiva) &&
      (!filtroExtra || filtroExtra(p)));   // ← FILTRO A PRUEBA (borrar esta línea)

    grid.replaceChildren(
      ...(lista.length
        ? lista.map(tarjeta)
        : [Object.assign(document.createElement("p"), {
            className: "muted center",
            textContent: "No hay productos en esta categoría.",
          })])
    );
  }

  function renderFiltros(categorias = []) {
    const todas = [{ id: "todos", nombre: "Todos" }, ...categorias];
    filtros.replaceChildren(...todas.map((c) => {
      const b = document.createElement("button");
      b.className = "chip" + (c.id === categoriaActiva ? " is-active" : "");
      b.type = "button";
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