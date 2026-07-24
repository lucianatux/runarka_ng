// ============================================================
// site-footer.js — <site-footer>
// Único responsable: el pie de TODAS las páginas.
// El año se calcula solo (adiós al <script> suelto del index).
// ============================================================

import { PAGINAS } from "./site-header.js";

class SiteFooter extends HTMLElement {
  connectedCallback() {
    const enlaces = PAGINAS
      .map((p) => `<a href="${p.href}">${p.menu}</a>`)
      .join("");

    this.innerHTML = `
      <footer class="site-footer">
        <div class="container site-footer__inner">
          <span>© ${new Date().getFullYear()} Runarka · Neuquén, Patagonia Argentina</span>
          <nav class="site-footer__nav" aria-label="Pie de página">${enlaces}</nav>
          <span>Piedras naturales energéticas</span>
        </div>
      </footer>`;
  }
}

customElements.define("site-footer", SiteFooter);
