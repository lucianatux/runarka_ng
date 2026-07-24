// ============================================================
// modal-opciones.js — Formulario de opciones de un producto.
// Único responsable: preguntar talle / fecha / lo que el JSON
// declare, y devolver las respuestas.
//
//   const opciones = await pedirOpciones(producto);
//   opciones === null  →  la persona canceló
//
// Las respuestas se devuelven indexadas por el LABEL de cada
// opción, porque ese mismo texto es el que se lee después en
// el mensaje de WhatsApp.
// ============================================================

import { opcionesDe } from "../producto.js";
import { formatearPrecio } from "../whatsapp.js";
import { esc } from "./dom.js";

function campo(op) {
  const req = op.requerido ? "required" : "";
  const id = `op-${esc(op.id)}`;

  let control;
  if (op.tipo === "select") {
    const items = (op.valores || [])
      .map((v) => `<option value="${esc(v)}">${esc(v)}</option>`)
      .join("");
    control = `<select id="${id}" name="${esc(op.label)}" ${req}>
                 <option value="">Elegí una opción</option>${items}
               </select>`;
  } else {
    const tipos = { fecha: "date", numero: "number", texto: "text" };
    control = `<input id="${id}" name="${esc(op.label)}"
                      type="${tipos[op.tipo] || "text"}"
                      placeholder="${esc(op.placeholder || "")}" ${req}>`;
  }

  const ayuda = op.ayuda
    ? `<small class="field__help">${esc(op.ayuda)}</small>`
    : "";

  return `<div class="field">
            <label for="${id}">${esc(op.label)}${op.requerido ? "" : " <span class='muted'>(opcional)</span>"}</label>
            ${control}${ayuda}
          </div>`;
}

export function pedirOpciones(producto, tienda = {}) {
  const opciones = opcionesDe(producto);
  if (!opciones.length) return Promise.resolve({});

  return new Promise((resolve) => {
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.innerHTML = `
      <div class="modal__backdrop" data-cerrar></div>
      <div class="modal__panel panel" role="dialog" aria-modal="true"
           aria-labelledby="modal-titulo">
        <div class="modal__head">
          <div>
            <h2 class="modal__titulo" id="modal-titulo">${esc(producto.nombre)}</h2>
            <p class="modal__precio">${formatearPrecio(producto.precio, tienda.moneda)}</p>
          </div>
          <button class="icon-btn" type="button" data-cerrar aria-label="Cerrar">✕</button>
        </div>

        <form class="modal__form" novalidate>
          ${opciones.map(campo).join("")}
          <button class="btn btn--primary btn--block" type="submit">Agregar al pedido</button>
        </form>
      </div>`;

    document.body.appendChild(modal);
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => modal.classList.add("is-open"));

    const form = modal.querySelector("form");

    function cerrar(valor) {
      document.removeEventListener("keydown", alTeclado);
      document.body.style.overflow = "";
      modal.classList.remove("is-open");
      setTimeout(() => modal.remove(), 250);
      resolve(valor);
    }

    function alTeclado(e) { if (e.key === "Escape") cerrar(null); }

    modal.querySelectorAll("[data-cerrar]").forEach((b) =>
      b.addEventListener("click", () => cerrar(null)));
    document.addEventListener("keydown", alTeclado);

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      // Validación propia: el mensaje del navegador se pierde
      // adentro del modal en pantallas chicas.
      const faltante = [...form.elements].find(
        (el) => el.required && !el.value.trim()
      );
      if (faltante) {
        faltante.classList.add("is-error");
        faltante.focus();
        faltante.addEventListener("input", () =>
          faltante.classList.remove("is-error"), { once: true });
        return;
      }

      const elegidas = {};
      opciones.forEach((op) => {
        const valor = form.elements[op.label]?.value.trim();
        if (valor) elegidas[op.label] = valor;
      });
      cerrar(elegidas);
    });

    // Foco en el primer campo, para poder escribir sin tocar nada.
    form.querySelector("input, select")?.focus();
  });
}
