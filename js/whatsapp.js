// ============================================================
// whatsapp.js — Formato de precios y armado del pedido.
// Único responsable: convertir el carrito en un link de WhatsApp.
//
// Ya no necesita el catálogo: cada línea del carrito trae su
// nombre y su precio adentro.
// ============================================================

export function formatearPrecio(n, moneda = "$") {
  return moneda + Math.round(Number(n) || 0).toLocaleString("es-AR");
}

// Precio de una línea. Con más de una unidad muestra el unitario,
// así se entiende de dónde sale el subtotal.
//   1 unidad  →  $25.000
//   2 o más   →  $15.000 c/u = $30.000
export function detallePrecio(linea, moneda = "$") {
  const subtotal = formatearPrecio(linea.precio * linea.cant, moneda);
  if (linea.cant <= 1) return subtotal;
  return `${formatearPrecio(linea.precio, moneda)} c/u = ${subtotal}`;
}

export function calcularTotal(carrito) {
  return carrito.lineas.reduce((acc, l) => acc + l.precio * l.cant, 0);
}

// Las opciones elegidas, una por renglón, indentadas bajo el producto.
function detalleOpciones(linea) {
  return Object.entries(linea.opciones || {})
    .filter(([, valor]) => valor !== "" && valor != null)
    .map(([etiqueta, valor]) => `   ↳ ${etiqueta}: ${valor}`);
}

export function armarMensaje(carrito, tienda = {}) {
  const partes = [tienda.mensajeIntro || "¡Hola! Quiero hacer este pedido:", ""];

  const nombre = (carrito.nombre || "").trim();
  if (nombre) partes.push(`Soy ${nombre}.`, "");

  carrito.lineas.forEach((l) => {
    partes.push(
      `• ${l.cant}x ${l.nombre} — ${detallePrecio(l, tienda.moneda)}`,
      ...detalleOpciones(l)
    );
  });

  partes.push("", `Total: ${formatearPrecio(calcularTotal(carrito), tienda.moneda)}`);

  const comentarios = (carrito.comentarios || "").trim();
  if (comentarios) partes.push("", `Comentarios: ${comentarios}`);

  return partes.join("\n");
}

export function armarLinkWhatsApp(carrito, tienda = {}) {
  const texto = encodeURIComponent(armarMensaje(carrito, tienda));
  return `https://wa.me/${tienda.whatsapp}?text=${texto}`;
}