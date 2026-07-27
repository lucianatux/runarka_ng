// ============================================================
// analytics.js — Google Analytics 4.
// Único responsable: cargar gtag y reportar.
//
// Para sacarlo del sitio: borrá el import y la llamada en main.js.
// Nada más depende de este archivo.
// ============================================================

// ⚠️ PEGAR ACÁ EL ID DE MEDICIÓN DE RUNARKA (Admin → Flujos de datos).
// Tiene la forma "G-XXXXXXXXXX". Mientras diga PONER_ID no se carga nada.
const GA_ID = "PONER_ID";

// Durante el desarrollo no queremos ensuciar las estadísticas con
// nuestras propias visitas.
function esDesarrollo() {
  const h = location.hostname;
  return h === "localhost" || h === "127.0.0.1" || h === "" || h.endsWith(".local");
}

export function initAnalytics() {
  if (!GA_ID.startsWith("G-")) return;      // sin ID configurado
  if (esDesarrollo()) return;

  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", GA_ID);
}

// Para medir acciones puntuales más adelante:
//   evento("add_to_cart", { item_name: "Pulsera 01", value: 15000 });
export function evento(nombre, datos = {}) {
  if (typeof window.gtag === "function") window.gtag(nombre, datos);
}
