# Wiki XynA · Astro

Proyecto de Biología Sintética II de UTEC, reorganizado como una wiki de lectura por páginas. Conserva el contenido científico, los datos, las referencias, el equipo y las figuras de la versión HTML existente.

## Abrir el proyecto

Requiere Node.js 22.23.4 o posterior. Se comprobó con Node.js 26.12.1.

```bash
npm ci
npm run dev
```

Abre la dirección local que aparece en la terminal, normalmente `http://127.0.0.1:4321/`.

Astro necesita su servidor local durante el desarrollo. Las páginas de `src/` no se abren con doble clic como un HTML independiente.

Esta versión de Astro administra sus servidores en segundo plano. Para cerrar las vistas locales:

```bash
npm exec -- astro dev stop
npm exec -- astro preview stop
```

## Comprobar y compilar

```bash
npm run build
npm run preview
```

La compilación genera el sitio estático en `dist/`. La comprobación incluida verifica:

- Los 357 bloques de contenido científico de la wiki anterior.
- El contenido de la portada y sus valores.
- Las 12 figuras científicas utilizadas, mediante sus huellas SHA-256.
- La copia completa del HTML original para descargar.
- Las 13 páginas y sus recursos locales.
- La ausencia de la nota de contribuciones y del botón de pausa, retirados a petición del usuario.

## Organización

- `/`: portada, pregunta y acceso a las secciones.
- `/proyecto/`: fundamento, objetivo e hipótesis.
- `/diseno/`: componentes, figuras en pestañas y detalles del ensamblaje.
- `/experimento/`: flujo, réplicas, ensayos, controles, materiales y PCR.
- `/evidencia/`: índice de los seis temas publicados.
- `/evidencia/promotores/`, `/coronta/`, `/proteina/`, `/estabilidad/`, `/productos/` y `/metodo/`: una pregunta por página.
- `/equipo/`: integrantes y profesor.
- `/referencias/`: bibliografía y créditos de las imágenes.

El buscador funciona localmente y permite abrir directamente los desplegables encontrados. Las figuras se pueden ampliar y descargar.

## Editar el contenido

El contenido estructurado está en `src/data/wiki.json`. Sus elementos mantienen los textos y etiquetas de la wiki original. La presentación se define por separado en `src/styles/global.css`, `src/layouts/` y `src/components/`.

`scripts/prepare-content.mjs` genera los destinos de los enlaces y el índice de búsqueda. Se ejecuta automáticamente al compilar. Después de una edición de contenido, también puedes ejecutar `npm run prepare:content` durante el desarrollo.

`src/data/content-manifest.json` registra la versión original para comprobar la conservación. Si cambias contenido a propósito, revisa y actualiza esa referencia de forma consciente; no la regeneres para ocultar pérdidas accidentales.

Las imágenes están en `public/figures/` y los logos en `public/brand/`. La versión HTML independiente, con todas las imágenes incorporadas, sigue disponible en `public/downloads/wiki-xyna-completa.html`.

## Componentes y movimiento

Se usan componentes reales de shadcn/ui: Button, Accordion, Dialog, Tabs, Sheet y Command. Los archivos están incluidos en `src/components/ui/`, para poder revisarlos y modificarlos.

De Magic UI se utilizan Blur Fade y Scroll Progress. La presentación mantiene el fondo blanco, los colores planos y movimientos breves. Blur Fade se configura sin desenfoque y el progreso usa un único color. Se respeta la preferencia del sistema para reducir movimiento.

Las fuentes Nunito e Inter se sirven desde el propio proyecto. El funcionamiento del sitio no depende de fuentes o imágenes alojadas por terceros.

La identidad visual usa verde lima, tipografía redondeada e ilustraciones originales de la mascota XynA. La mascota es una representación conceptual de una enzima; las ilustraciones decorativas no sustituyen ninguna figura del informe. Las imágenes generadas se guardan en `public/illustrations/`, con sus indicaciones en `ASSETS-ILUSTRACIONES.json`. El nuevo icono vectorial está en `public/brand/xyna-mascota.svg`. Los archivos de marca anteriores se conservan.

Consulta `THIRD-PARTY-NOTICES.txt` para las fuentes y licencias de los componentes. El contenido y las figuras de investigación mantienen sus créditos originales.

## Preparado para un repositorio

El proyecto incluye `package-lock.json`, `.gitignore`, `.env.example` y una configuración de salida estática. No se creó ningún repositorio ni se publicó el sitio.

Cuando se conozca el destino de GitHub Pages, configura `SITE_URL` y `BASE_PATH` al compilar. Todos los enlaces, imágenes, descargas y entradas del buscador utilizan la misma base.

Ejemplo de configuración para un repositorio llamado `xyna-wiki`:

```bash
SITE_URL=https://TU-USUARIO.github.io BASE_PATH=/xyna-wiki npm run build
```

Para un dominio propio o un sitio publicado en la raíz, deja `BASE_PATH=/`. La guía oficial de Astro explica la publicación: https://docs.astro.build/en/guides/deploy/github/.

## Compartir con el equipo

Para trabajar en Astro, comparte la carpeta del proyecto o su ZIP; cada persona ejecuta `npm ci` y `npm run dev` en su computadora. Una dirección `localhost` o `file:///Users/...` no se comparte como enlace de Internet.

Para enviar una copia de lectura que se abra con doble clic, usa el HTML independiente que se ofrece en la navegación lateral. La publicación con un enlace web se puede preparar después en GitHub Pages u otro alojamiento estático.
