// ============================================================
// catalog.view.js — Vista del catálogo.
// Único responsable: dibujar productos, filtros y buscadores.
// La DECISIÓN de qué producto pasa el filtro vive en
// catalog.filters.js (SRP): esta vista solo delega y dibuja.
// ============================================================

import { formatearPrecio } from "./whatsapp.js";
import { imagenesDe } from "./producto.js";
import { crearFiltrosCatalogo } from "./catalog.filters.js";

// Placeholder gris para cuando falta una foto (no rompe el diseño)
const IMG_FALLBACK =
  "data:image/svg+xml," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240">' +
    '<rect width="100%" height="100%" fill="#f3ead8"/>' +
    '<text x="50%" y="50%" font-family="serif" font-size="16" fill="#b6a079" ' +
    'text-anchor="middle" dominant-baseline="middle">Runarka</text></svg>');

export function crearCatalogo({ grid, filtros, buscadores, tienda, opciones = {}, productos, onAgregar }) {
  let categoriaActiva = "todos";
  const estado = crearFiltrosCatalogo();      // categoría + emoción + piedra

  function tarjeta(p) {
    const imgs = imagenesDe(p);
    const fuentes = imgs.length ? imgs : [""];   // al menos una (muestra placeholder)

    // Cada foto es un "slide" con DOS imágenes de la misma URL:
    // atrás una en 'cover' + blur (rellena márgenes), adelante la
    // nítida en 'contain'. Misma URL => se descarga una sola vez.
    const slides = fuentes.map((src) =>
      `<div class="product__slide">
         <img class="product__blur" src="${src}" alt="" aria-hidden="true"
              loading="lazy" onerror="this.remove()">
         <img class="product__photo" src="${src}" alt="${p.nombre}"
              loading="lazy" onerror="this.onerror=null;this.src='${IMG_FALLBACK}'">
       </div>`).join("");

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
    const lista = estado.aplicar(productos);

    grid.replaceChildren(
      ...(lista.length
        ? lista.map(tarjeta)
        : [Object.assign(document.createElement("p"),
            { className: "muted center", textContent: "No encontramos piezas con esos filtros." })])
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
        estado.setCategoria(c.id);
        [...filtros.children].forEach((x) => x.classList.toggle("is-active", x === b));
        render();
      });
      return b;
    }));
  }

  // Desplegable propio (no nativo) para poder estilarlo por completo.
  // Reutilizable: emoción o piedra. Misma API: onChange(valor).
  function crearSelect({ etiqueta, placeholder, valores, onChange }) {
    const opciones = [{ value: "", label: placeholder }, ...valores.map((v) => ({ value: v, label: v }))];

    const root = document.createElement("div");
    root.className = "dropdown";
    root.innerHTML = `
      <button type="button" class="dropdown__trigger" aria-haspopup="listbox" aria-expanded="false">
        <span class="dropdown__label">${etiqueta}</span>
        <span class="dropdown__value">${placeholder}</span>
        <svg class="dropdown__caret" viewBox="0 0 12 8" aria-hidden="true"><path d="M1 1.5 6 6.5 11 1.5"/></svg>
      </button>
      <ul class="dropdown__menu" role="listbox" hidden>
        ${opciones.map((o) =>
          `<li class="dropdown__option" role="option" data-value="${o.value}"
               aria-selected="${o.value === "" ? "true" : "false"}">${o.label}</li>`
        ).join("")}
      </ul>`;

    const trigger = root.querySelector(".dropdown__trigger");
    const valueEl = root.querySelector(".dropdown__value");
    const menu = root.querySelector(".dropdown__menu");
    const items = [...root.querySelectorAll(".dropdown__option")];

    const abrir  = () => { menu.hidden = false; root.classList.add("is-open"); trigger.setAttribute("aria-expanded", "true"); };
    const cerrar = () => { menu.hidden = true;  root.classList.remove("is-open"); trigger.setAttribute("aria-expanded", "false"); };

    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      root.classList.contains("is-open") ? cerrar() : abrir();
    });

    items.forEach((li) => {
      li.addEventListener("click", () => {
        const valor = li.dataset.value;
        valueEl.textContent = li.textContent;
        items.forEach((x) => x.setAttribute("aria-selected", String(x === li)));
        root.classList.toggle("has-value", valor !== "");   // resalta si el filtro está activo
        cerrar();
        onChange(valor);
        render();
      });
    });

    // Cerrar al clickear afuera o con Escape
    document.addEventListener("click", (e) => { if (!root.contains(e.target)) cerrar(); });
    root.addEventListener("keydown", (e) => { if (e.key === "Escape") { cerrar(); trigger.focus(); } });

    return root;
  }

  function renderBuscadores() {
    if (!buscadores) return;                    // sin contenedor = feature desactivada
    const nodos = [];

    if (opciones.emociones?.length) {
      nodos.push(crearSelect({
        etiqueta: "Emoción", placeholder: "Todas",
        valores: opciones.emociones,
        onChange: (v) => estado.setEmocion(v),
      }));
    }
    if (opciones.piedras?.length) {
      nodos.push(crearSelect({
        etiqueta: "Piedra", placeholder: "Todas",
        valores: opciones.piedras,
        onChange: (v) => estado.setPiedra(v),
      }));
    }
    buscadores.replaceChildren(...nodos);
    buscadores.hidden = nodos.length === 0;     // no deja un hueco vacío
  }

  return { render, renderFiltros, renderBuscadores };
}
