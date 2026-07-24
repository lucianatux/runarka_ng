// ============================================================
// cart-drawer.js — <cart-drawer>
// Único responsable: dibujar el carrito y reflejar su estado.
//
// Se monta en las 7 páginas. main.js le pasa el carrito:
//   document.querySelector("cart-drawer").conectar({ carrito, tienda });
// ============================================================

import { detallePrecio, calcularTotal, armarLinkWhatsApp } from "../whatsapp.js";
import { esc } from "../ui/dom.js";

const ICONO_CERRAR = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>`;

class CartDrawer extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="overlay" data-cerrar></div>

      <aside class="cart" aria-label="Tu pedido">
        <div class="cart__head">
          <h2>Tu pedido</h2>
          <button class="icon-btn" type="button" data-cerrar
                  aria-label="Cerrar carrito">${ICONO_CERRAR}</button>
        </div>

        <div class="cart__items"></div>

        <div class="cart__foot">
          <div class="cart__campos">
            <div class="field">
              <label for="cart-nombre">Tu nombre</label>
              <input id="cart-nombre" type="text" placeholder="¿Con quién hablamos?">
            </div>
            <div class="field">
              <label for="cart-comentarios">Comentarios <span class="muted">(opcional)</span></label>
              <textarea id="cart-comentarios" rows="2"
                        placeholder="Algo que quieras aclarar del pedido"></textarea>
            </div>
          </div>

          <div class="cart__total"><span>Total</span><span data-total>$0</span></div>

          <button class="btn btn--primary btn--block" type="button" data-checkout>
            Finalizar por WhatsApp
          </button>
          <button class="btn btn--ghost btn--block btn--sm" type="button" data-vaciar>
            Vaciar carrito
          </button>
          <p class="cart__note">
            Coordinás el pago y la entrega directamente por WhatsApp.
          </p>
        </div>
      </aside>`;

    this.$ = (sel) => this.querySelector(sel);
    this.drawer = this.$(".cart");
    this.overlay = this.$(".overlay");
    this.lista = this.$(".cart__items");
    this.inputNombre = this.$("#cart-nombre");
    this.inputComentarios = this.$("#cart-comentarios");
    this.badge = document.querySelector("#cart-count");   // vive en el header

    this._eventos();
  }

  // --- main.js nos entrega el modelo ---
  // Se llama dos veces: una apenas carga (para dibujar el carrito
  // guardado sin esperar la red) y otra cuando llegó productos.json
  // con los datos de la tienda. La suscripción se hace una sola vez.
  conectar({ carrito, tienda }) {
    if (this.carrito !== carrito) {
      this.carrito = carrito;
      this.inputNombre.value = carrito.nombre;
      this.inputComentarios.value = carrito.comentarios;
      carrito.suscribir(() => this.render());
    }
    this.tienda = tienda || {};
    this.render();
  }

  // --- Abrir / cerrar ---
  abrir() {
    this.drawer.classList.add("is-open");
    this.overlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
    this.$("[data-cerrar].icon-btn")?.focus();
  }

  cerrar() {
    this.drawer.classList.remove("is-open");
    this.overlay.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  _eventos() {
    document.addEventListener("runarka:abrir-carrito", () => this.abrir());
    this.querySelectorAll("[data-cerrar]").forEach((b) =>
      b.addEventListener("click", () => this.cerrar()));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.drawer.classList.contains("is-open")) this.cerrar();
    });

    // Se guardan mientras se escribe (sin redibujar: se perdería el foco)
    this.inputNombre.addEventListener("input", (e) => {
      this.carrito.nombre = e.target.value;
      e.target.classList.remove("is-error");
    });
    this.inputComentarios.addEventListener("input", (e) => {
      this.carrito.comentarios = e.target.value;
    });

    this.$("[data-vaciar]").addEventListener("click", () => {
      if (this.carrito.vacio) return;
      this.carrito.vaciar();
      this.inputComentarios.value = "";
    });

    this.$("[data-checkout]").addEventListener("click", () => this._enviar());
  }

  _enviar() {
    if (this.carrito.vacio) return;

    if (!this.carrito.nombre.trim()) {
      this.inputNombre.classList.add("is-error");
      this.inputNombre.focus();
      return;
    }

    // El carrito NO se vacía: si el link no abrió, el pedido sigue ahí.
    window.open(armarLinkWhatsApp(this.carrito, this.tienda), "_blank");
  }

  // --- Una línea del carrito ---
  _fila(l) {
    const opciones = Object.entries(l.opciones || {})
      .map(([k, v]) => `<li><span>${esc(k)}:</span> ${esc(v)}</li>`)
      .join("");

    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <img class="cart-item__img" src="${esc(l.imagen)}" alt=""
           onerror="this.style.visibility='hidden'">
      <div>
        <div class="cart-item__name">${esc(l.nombre)}</div>
        <div class="cart-item__price">${detallePrecio(l, this.tienda.moneda)}</div>
        ${opciones ? `<ul class="cart-item__opciones">${opciones}</ul>` : ""}
        <div class="stepper">
          <button type="button" aria-label="Restar uno">−</button>
          <span>${l.cant}</span>
          <button type="button" aria-label="Sumar uno">+</button>
        </div>
      </div>
      <button class="cart-item__remove" type="button" aria-label="Quitar del pedido">×</button>`;

    const [menos, mas] = row.querySelectorAll(".stepper button");
    menos.addEventListener("click", () => this.carrito.fijar(l.key, l.cant - 1));
    mas.addEventListener("click", () => this.carrito.fijar(l.key, l.cant + 1));
    row.querySelector(".cart-item__remove")
      .addEventListener("click", () => this.carrito.quitar(l.key));
    return row;
  }

  render() {
    if (!this.carrito) return;
    const { carrito } = this;

    // Badge del header: late solo cuando SUMA, no al restar.
    if (this.badge) {
      const antes = Number(this.badge.textContent) || 0;
      this.badge.textContent = carrito.totalItems;
      this.badge.hidden = carrito.vacio;
      if (carrito.totalItems > antes) {
        this.badge.classList.remove("is-bump");
        void this.badge.offsetWidth;              // reinicia la animación
        this.badge.classList.add("is-bump");
      }
    }

    if (carrito.vacio) {
      this.lista.innerHTML =
        `<p class="cart__empty">Todavía no elegiste ninguna pieza.<br>
         Cuando sumes una, aparece acá.</p>`;
      this.$("[data-checkout]").setAttribute("disabled", "");
      this.$("[data-vaciar]").setAttribute("disabled", "");
    } else {
      this.lista.replaceChildren(...carrito.lineas.map((l) => this._fila(l)));
      this.$("[data-checkout]").removeAttribute("disabled");
      this.$("[data-vaciar]").removeAttribute("disabled");
    }

    this.$("[data-total]").textContent =
      detallePrecio({ precio: calcularTotal(carrito), cant: 1 }, this.tienda.moneda);
  }
}

customElements.define("cart-drawer", CartDrawer);
