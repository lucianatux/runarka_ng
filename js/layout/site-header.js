// ============================================================
// site-header.js — <site-header>
// Único responsable: el encabezado de TODAS las páginas.
// Se escribe una vez acá y se usa con <site-header></site-header>.
//
// Sin Shadow DOM a propósito: así el CSS de tokens.css,
// components.css y layout.css sigue aplicando igual que antes.
// ============================================================

// --- Rutas de los logos (están en assets/logos/, no en assets/) ---
export const LOGO_HEADER = "assets/logos/logo2.png";
export const LOGO_HERO = "assets/logos/logo3.png";

// --- El menú del sitio. Cambiar acá cambia las 7 páginas. ---
export const PAGINAS = [
  { href: "filosofia.html",   menu: "Filosofía",   titulo: "Nuestra Filosofía" },
  { href: "amuletos.html",    menu: "Amuletos",    titulo: "Amuletos Personalizados" },
  { href: "colecciones.html", menu: "Colecciones", titulo: "Colecciones Runarka" },
  { href: "runas.html",       menu: "Runas",       titulo: "Runas y Símbolos" },
  { href: "grimorio.html",    menu: "Grimorio",    titulo: "El Grimorio Runarka" },
  { href: "contacto.html",    menu: "Contacto",    titulo: "Contacto" },
];

export function paginaActual() {
  return location.pathname.split("/").pop() || "index.html";
}

const ICONO_LUNA = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
    <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" />
  </svg>`;

const ICONO_CARRITO = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
       stroke-linecap="round" stroke-linejoin="round">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L23 6H6" />
  </svg>`;

const ICONO_MENU = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
    <path d="M3 6h18M3 12h18M3 18h18" />
  </svg>`;

class SiteHeader extends HTMLElement {
  connectedCallback() {
    const actual = paginaActual();

    const enlaces = PAGINAS.map((p) => {
      const activo = p.href === actual ? ' aria-current="page"' : "";
      return `<a href="${p.href}"${activo}>${p.menu}</a>`;
    }).join("");

    this.innerHTML = `
      <header class="site-header">
        <div class="container site-header__inner">
          <a class="brand" href="index.html" aria-label="Runarka · Inicio">
            <img src="${LOGO_HEADER}" alt="" onerror="this.style.display='none'">
          </a>

          <nav class="nav" id="nav" aria-label="Principal">${enlaces}</nav>

          <div class="header-actions">
            <button class="icon-btn" id="theme-toggle"
                    aria-label="Cambiar tema" title="Modo claro/oscuro">${ICONO_LUNA}</button>

            <button class="icon-btn" id="cart-open" aria-label="Abrir carrito">
              ${ICONO_CARRITO}
              <span class="badge" id="cart-count" hidden>0</span>
            </button>

            <button class="icon-btn nav-toggle" id="nav-toggle"
                    aria-label="Abrir menú" aria-expanded="false">${ICONO_MENU}</button>
          </div>
        </div>
      </header>`;

    this._menuMovil();
    this._botonCarrito();
  }

  // --- Menú hamburguesa ---
  _menuMovil() {
    const nav = this.querySelector("#nav");
    const boton = this.querySelector("#nav-toggle");

    const cerrar = () => {
      nav.classList.remove("is-open");
      boton.setAttribute("aria-expanded", "false");
    };

    boton.addEventListener("click", (e) => {
      e.stopPropagation();
      const abierto = nav.classList.toggle("is-open");
      boton.setAttribute("aria-expanded", String(abierto));
    });

    nav.addEventListener("click", (e) => { if (e.target.tagName === "A") cerrar(); });
    document.addEventListener("click", (e) => { if (!this.contains(e.target)) cerrar(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") cerrar(); });
  }

  // --- El header no conoce al carrito: solo avisa que lo abran ---
  _botonCarrito() {
    this.querySelector("#cart-open").addEventListener("click", () => {
      document.dispatchEvent(new CustomEvent("runarka:abrir-carrito"));
    });
  }
}

customElements.define("site-header", SiteHeader);