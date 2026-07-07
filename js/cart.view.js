// ============================================================
// cart.view.js — Vista del carrito.
// Único responsable: dibujar el drawer y reflejar el estado.
// ============================================================

import { formatearPrecio, calcularTotal, armarLinkWhatsApp } from "./whatsapp.js";
import { imagenPrincipal } from "./producto.js";

export function crearVistaCarrito({ refs, tienda, productosPorId, carrito }) {
  const { drawer, overlay, lista, totalEl, contador, btnCheckout, btnVaciar } = refs;

  function abrir()  { drawer.classList.add("is-open");  overlay.classList.add("is-open");  document.body.style.overflow = "hidden"; }
  function cerrar() { drawer.classList.remove("is-open"); overlay.classList.remove("is-open"); document.body.style.overflow = ""; }

  function fila(id, cant) {
    const p = productosPorId[id];
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <img class="cart-item__img" src="${imagenPrincipal(p)}" alt="${p.nombre}"
           onerror="this.style.visibility='hidden'">
      <div>
        <div class="cart-item__name">${p.nombre}</div>
        <div class="cart-item__price">${formatearPrecio(p.precio, tienda.moneda)} c/u</div>
        <div class="stepper">
          <button aria-label="Restar">−</button>
          <span>${cant}</span>
          <button aria-label="Sumar">+</button>
        </div>
      </div>
      <button class="cart-item__remove" aria-label="Quitar">×</button>`;

    const [menos, mas] = row.querySelectorAll(".stepper button");
    menos.addEventListener("click", () => carrito.fijar(id, cant - 1));
    mas.addEventListener("click",   () => carrito.fijar(id, cant + 1));
    row.querySelector(".cart-item__remove").addEventListener("click", () => carrito.quitar(id));
    return row;
  }

  function render() {
    contador.textContent = carrito.totalItems;
    contador.hidden = carrito.vacio;

    if (carrito.vacio) {
      lista.innerHTML = `<p class="cart__empty">Tu carrito está vacío.<br>Sumá amuletos para empezar.</p>`;
      btnCheckout.setAttribute("disabled", "");
    } else {
      lista.replaceChildren(...carrito.lineas.map(({ id, cant }) => fila(id, cant)));
      btnCheckout.removeAttribute("disabled");
    }
    totalEl.textContent = formatearPrecio(calcularTotal(carrito, productosPorId), tienda.moneda);
  }

  // Conexiones propias del carrito
  btnCheckout.addEventListener("click", () => {
    if (carrito.vacio) return;
    window.open(armarLinkWhatsApp(carrito, productosPorId, tienda), "_blank");
  });
  btnVaciar.addEventListener("click", () => carrito.vaciar());
  overlay.addEventListener("click", cerrar);

  return { render, abrir, cerrar };
}
