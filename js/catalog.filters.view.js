// ============================================================
// catalog.filters.view.js — Controles de intención y piedra.
// Único responsable: dibujar los dos selectores y avisar cuando
// cambian. La lógica de filtrado es de catalog.filters.js.
//
// ─── MÓDULO A PRUEBA ────────────────────────────────────────
// Se muestra solo si productos.json trae un bloque "filtros".
// Para sacarlo del sitio: borrar este archivo, css/filters.css,
// el <link> de colecciones.html y el bloque marcado en main.js.
// ─────────────────────────────────────────────────────────────
// ============================================================

import { esc } from "./ui/dom.js";

function selector(id, etiqueta, valores) {
  const opciones = valores
    .map((v) => `<option value="${esc(v)}">${esc(v)}</option>`)
    .join("");

  return `
    <div class="filtro-extra">
      <label for="${id}">${esc(etiqueta)}</label>
      <select id="${id}">
        <option value="">Todas</option>
        ${opciones}
      </select>
    </div>`;
}

export function crearFiltrosExtra({ contenedor, vocabulario = {}, alCambiar }) {
  const estados = vocabulario.estados || [];
  const piedras = vocabulario.piedras || [];
  if (!contenedor || (!estados.length && !piedras.length)) return null;

  contenedor.innerHTML = `
    ${estados.length ? selector("filtro-estado", "Para", estados) : ""}
    ${piedras.length ? selector("filtro-piedra", "Piedra", piedras) : ""}
    <button class="btn btn--ghost btn--sm" type="button" id="filtro-limpiar" hidden>
      Limpiar
    </button>`;

  const selEstado = contenedor.querySelector("#filtro-estado");
  const selPiedra = contenedor.querySelector("#filtro-piedra");
  const btnLimpiar = contenedor.querySelector("#filtro-limpiar");

  function avisar() {
    const estado = selEstado?.value || "";
    const piedra = selPiedra?.value || "";
    btnLimpiar.hidden = !estado && !piedra;
    alCambiar({ estado, piedra });
  }

  selEstado?.addEventListener("change", avisar);
  selPiedra?.addEventListener("change", avisar);
  btnLimpiar.addEventListener("click", () => {
    if (selEstado) selEstado.value = "";
    if (selPiedra) selPiedra.value = "";
    avisar();
  });

  return { avisar };
}
