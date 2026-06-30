// ============================================================
// whatsapp.js — Formato de precios y armado del pedido.
// Único responsable: convertir el carrito en un link de WhatsApp.
// ============================================================

export function formatearPrecio(n, moneda = "$") {
  return moneda + Number(n).toLocaleString("es-AR");
}

export function calcularTotal(carrito, productosPorId) {
  return carrito.lineas.reduce(
    (acc, { id, cant }) => acc + (productosPorId[id]?.precio || 0) * cant, 0);
}

export function armarLinkWhatsApp(carrito, productosPorId, tienda) {
  const lineas = carrito.lineas.map(({ id, cant }) => {
    const p = productosPorId[id];
    return `• ${cant}x ${p.nombre} — ${formatearPrecio(p.precio * cant, tienda.moneda)}`;
  });

  const texto = [
    tienda.mensajeIntro || "¡Hola! Quiero hacer este pedido:",
    "",
    ...lineas,
    "",
    `Total: ${formatearPrecio(calcularTotal(carrito, productosPorId), tienda.moneda)}`,
  ].join("\n");

  return `https://wa.me/${tienda.whatsapp}?text=${encodeURIComponent(texto)}`;
}
