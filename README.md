# Runarka — Catálogo con pedidos por WhatsApp

Página de ventas: catálogo + carrito que arma el pedido y lo cierra por WhatsApp.
Sin pasarela de pago. El pago se coordina por WhatsApp (efectivo o transferencia).

## Estructura

```
runarka/
├── index.html            ← la página (estructura/secciones)
├── productos.json        ← LO QUE EDITA LA CLIENTA (productos y precios)
├── assets/               ← fotos y logo (logo.png, foto1.jpg, ...)
├── css/
│   ├── tokens.css        ← colores, tipografía, espaciado (cambiás acá → cambia todo)
│   ├── base.css          ← reset y tipografía base
│   ├── components.css    ← botones, paneles, chips, badges (reutilizables)
│   ├── layout.css        ← header, hero, secciones, grilla, footer
│   └── cart.css          ← carrito lateral
└── js/
    ├── data.js           ← carga productos.json
    ├── cart.js           ← estado del carrito (qué hay adentro)
    ├── whatsapp.js       ← arma el mensaje/link de WhatsApp
    ├── catalog.view.js   ← dibuja el catálogo y filtros
    ├── cart.view.js      ← dibuja el carrito
    └── main.js           ← conecta todo (punto de entrada)
```

Cada archivo tiene **una sola responsabilidad** (SRP), así sumar o sacar
una función no rompe el resto.

## Cómo actualizar precios y productos (para la clienta)

Se edita **solo** `productos.json`. Reglas:
- Cambiar precios: solo el número (`"precio": 15000`), sin puntos ni `$`.
- Cada producto necesita un `id` único (sin espacios ni acentos).
- La `imagen` apunta a un archivo dentro de `assets/` (ej: `assets/foto1.jpg`).
- Para ocultar un producto sin borrarlo: poné `"disponible": false`.
- No borrar comas ni llaves. Si algo falla, suele ser una coma de más o de menos.

## Cambiar el número de WhatsApp

En `productos.json` → `tienda.whatsapp`. Formato internacional sin `+`, sin 0
y sin 15. Ejemplo Neuquén: `54 9 299 1234567` → `"5492991234567"`.

## Ver la página en tu compu (desarrollo)

El sitio usa `fetch` y módulos JS, así que **no** funciona abriendo el HTML con
doble clic (`file://`). Levantá un servidor local:
- VS Code: extensión **Live Server** → botón "Go Live".
- O por terminal en la carpeta del proyecto: `python -m http.server` y abrí
  `http://localhost:8000`.

## Publicar gratis (GitHub Pages)

1. Subí la carpeta a un repo de GitHub.
2. Settings → Pages → Source: rama `main`, carpeta `/root`.
3. Queda en `https://usuario.github.io/repo/` (después se le apunta el dominio).

En GitHub Pages anda directo (se sirve por HTTPS).

## Optimizar fotos sin perder calidad

Las fotos del celu pesan mucho (3–6 MB) y frenan la página. Workflow:

1. **Redimensionar** a tamaño real de pantalla. Las tarjetas son cuadradas,
   con ~**800×800 px** alcanza y sobra.
2. **Convertir a WebP** con calidad **~80** (mismo aspecto, hasta 70% menos peso).
3. **Sacar metadata** (geolocalización, etc.).
4. Guardá los originales aparte; en `assets/` van solo las optimizadas.

Herramientas:
- **Squoosh** (https://squoosh.app) — web, sin instalar. Arrastrás la foto,
  elegís WebP, calidad ~80, redimensionás a 800px y descargás. Ideal para la clienta.
- **ImageMagick** (terminal):
  `magick foto.jpg -resize 800x800^ -gravity center -extent 800x800 -strip -quality 82 assets/foto1.webp`
- **cwebp** (terminal):
  `cwebp -q 80 -resize 800 0 foto.jpg -o assets/foto1.webp`

> El `<img>` ya usa `loading="lazy"` y hay un placeholder si falta una foto,
> así nunca se ve roto.

## Modo oscuro

Está **listo**: los colores oscuros viven en `tokens.css` bajo `[data-theme="dark"]`
y el toggle (botón luna en el header) ya funciona y recuerda la elección.
Si por ahora no lo querés, borrá el botón `#theme-toggle` del `index.html`.
