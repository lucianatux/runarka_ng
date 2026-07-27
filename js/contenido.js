// ============================================================
// contenido.js — Renderiza el contenido editable de las páginas.
// Único responsable: convertir la lista de "bloques" de
// contenido.json en HTML. La clienta edita ESE archivo (el texto),
// nunca el HTML ni el JS.
//
// Se dibuja donde el HTML tenga un contenedor con data-contenido:
//   <div class="prosa" data-contenido="filosofia"></div>
// ============================================================

import { esc } from "./ui/dom.js";

// **negrita** → <strong>. Primero escapamos (para que el texto del
// JSON no pueda inyectar HTML) y recién después aplicamos el marcado
// simple que sí permitimos.
function texto(str = "") {
  return esc(str).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

// Cada tipo de bloque sabe dibujarse solo. Si aparece un tipo que no
// conocemos, se ignora (mejor eso que romper la página).
const plantillas = {
  titulo: (b) => `<h2 class="contenido__titulo">${esc(b.texto)}</h2>`,

  rol: (b) => `<p class="contenido__rol">${esc(b.texto)}</p>`,

  lead: (b) => `<p class="prosa__lead">${texto(b.texto)}</p>`,

  parrafo: (b) => `<p>${texto(b.texto)}</p>`,

  cita: (b) => `<blockquote class="cita">${texto(b.texto)}</blockquote>`,

  lista: (b) =>
    `<ul class="contenido__lista">${(b.items || [])
      .map((i) => `<li>${texto(i)}</li>`)
      .join("")}</ul>`,

  imagen: (b) => `
    <figure class="figura${b.retrato ? " figura--retrato" : ""}">
      <img src="${esc(b.src)}" alt="${esc(b.alt || "")}" loading="lazy"
           onerror="this.closest('.figura').style.display='none'">
    </figure>`,

  firma: (b) =>
    `<div class="prosa__firma">${(b.lineas || [])
      .map((l, i) =>
        i === 0
          ? `<strong>${esc(l)}</strong>`
          : `<span class="muted">${esc(l)}</span>`
      )
      .join("")}</div>`,

  boton: (b) =>
    `<p class="contenido__cta">
       <a class="btn btn--ghost" href="${esc(b.href)}">${esc(b.texto)}</a>
     </p>`,
};

export function renderContenido(contenedor, bloques) {
  if (!contenedor || !Array.isArray(bloques)) return;
  contenedor.innerHTML = bloques
    .map((b) => (plantillas[b.tipo] || (() => ""))(b))
    .join("");
}
