# Kivo — Escrow Descentralizado en Stellar

> Plataforma de pagos seguros con escrow on-chain sobre la red Stellar, con conversión fiat/crypto vía Etherfuse.

**Construido en StellarHack por el equipo:** Onii · Alfa · Daniel

---

## ¿Qué es Kivo?

Kivo es una dApp que permite a usuarios de Latinoamérica crear y gestionar **escrows descentralizados** sobre Stellar. Resuelve el problema de confianza en transacciones digitales al mantener los fondos bloqueados en un smart contract hasta que ambas partes confirman el cumplimiento del acuerdo.

---

## Funcionalidades implementadas

### Escrow on-chain (Trustless Work)
- Creación de escrows con monto, receptor y descripción directamente desde el navegador
- Visualización de todos los escrows activos del wallet conectado (drawer lateral)
- Detalle de cada escrow con estado, montos y partes involucradas
- Integración con el SDK `@trustless-work/escrow` en testnet y mainnet

### Onramp / Offramp (Etherfuse)
- **Onramp MXN → USDC**: el usuario transfiere pesos mexicanos vía SPEI y recibe USDC en su wallet Stellar
- **Offramp USDC → MXN**: el usuario quema USDC en Stellar y recibe pesos en su cuenta bancaria
- Cotización en tiempo real con expiración de 2 minutos
- Creación automática de trustline USDC si el wallet no la tiene
- Polling de estado de orden cada 3 segundos (persiste entre cierres del modal)
- Soporte de simulación fiat en ambiente de desarrollo (sandbox Etherfuse)

### Wallets soportados
- **Accesly** — wallet social, integración con `<ConnectButton />`
- **Freighter** — extensión de browser para Stellar

### Internacionalización
- Soporte completo para Español (MX), English (US) y Português (BR)
- Selector de idioma en la barra de navegación

### Red configurable
- Toggle Testnet / Mainnet en la navbar
- SDK y keys se intercambian automáticamente según la red seleccionada

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 19 + Vite |
| Blockchain | Stellar (`@stellar/stellar-sdk`) |
| Escrow SDK | `@trustless-work/escrow` v3 |
| Ramp | Etherfuse FX API (sandbox) |
| Wallet social | Accesly |
| Wallet browser | Freighter (`@stellar/freighter-api`) |
| Estado / DB | Supabase |
| QR | `qrcode.react` |

---

## Explorador de la red

Puedes verificar transacciones en Stellar Testnet aquí:

[https://stellar.expert/explorer/testnet](https://stellar.expert/explorer/testnet)

---

## Configuración

Copia `.env.example` y completa las variables:

```env
VITE_ETHERFUSE_API_KEY=          # API Key de Etherfuse
VITE_ETHERFUSE_BASE_URL=         # URL base (default: https://api.sand.etherfuse.com)
VITE_TRUSTLESS_API_KEY=          # API Key Trustless Work (testnet)
VITE_TRUSTLESS_API_KEY_MAINNET=  # API Key Trustless Work (mainnet)
VITE_SUPABASE_URL=               # URL de tu proyecto Supabase
VITE_SUPABASE_ANON_KEY=          # Anon key de Supabase
```

---

## Instalación y desarrollo

```bash
npm install
npm run dev
```

---

## Equipo

| Nombre | Rol |
|---|---|
| **Onii** | Fullstack / Integración Stellar & Etherfuse |
| **Alfa** | Fullstack / Smart Contracts & Escrow SDK |
| **Daniel** | Fullstack / UI/UX & Accesly |

---

## Hackathon

Proyecto desarrollado para **StellarHack 2026**.

## FIX_NOTES (rediseño /diseno, 2026-10-11)

- **La barra se cortaba en celular**: a 380 px, "Freighter" y "Connect Wallet" quedaban fuera de la pantalla y no se podían tocar. Ahora la barra hace wrap en filas.
- **Contraste**: `--muted` era `#63637e` sobre `#07070e` (≈3.3:1) y se usaba en textos secundarios de toda la página. Ahora es `#8f8fa8` (≈6:1).
- **Texto por debajo de 12 px**: 28 reglas de 9–11.5 px en `App.css` y `Ramp.css` subieron a 12 px.
- **Favicon equivocado**: `public/favicon.svg` era el logo por defecto de Vite. Ahora es el hexágono dorado de Kivo (el mismo de la barra), y hay `apple-touch-icon.png`.
- **SEO vacío**: el título era "kivo-stellar", `lang="en"` y sin descripción. Ahora hay título y descripción en español, `lang="es"`, canonical, Open Graph y X con `og.png` (captura real), `theme-color`, manifest, `robots.txt` y `sitemap.xml`.
- **Banderas emoji** en el selector de idioma (🇲🇽 🇺🇸 🇧🇷): se ven distinto en cada sistema (en Windows salen como letras). Se quitaron; quedan ES/EN/PT, con `aria-pressed`, a 36 px dentro de una pastilla de 44.

## DESIGN_NOTES

- **Fondo 3D: el dado sacó la receta 6 (malla low-poly con Three.js).** Se adaptó a la custodia misma (`src/components/EscrowScene.jsx`):
  - un **núcleo de alambre dorado**: los fondos retenidos;
  - **dos anillos** que orbitan en ejes distintos, el **comprador en turquesa y el vendedor en oro**. Cada ~9 s convergen —las dos confirmaciones— y el núcleo se enciende y crece: el dinero se libera;
  - una **nube de partículas** turquesa alrededor: los pagos de la red.
  - El puntero mueve la cámara y el scroll la aleja y la baja. Three.js va en un chunk aparte y se carga cuando el navegador queda libre. DPR ≤ 2, pausa con la pestaña oculta, menos detalle en celular (la escena se pone arriba y más chica) y un cuadro quieto con `prefers-reduced-motion`. Dependencia nueva: `three@0.170.0`.
- **Modo claro "papel de recibo"** (`#F7F5EF`): todos los `rgba()` de `App.css` y `Ramp.css` pasaron a tokens RGB (`--gold-rgb`, `--teal-rgb`, `--fg-rgb`…), y el oro y el turquesa se oscurecen en claro para pasar 4.5:1. El degradado del título termina en un dorado oscuro, no en el pálido. Botón luna/sol en la barra, con un script que lo aplica antes del primer pintado.

### Checklist de 2 minutos en el celular

1. Abre Kivo: arriba gira el núcleo dorado con sus dos anillos; espera ~9 s y se alinean.
2. Todos los botones de la barra (tema, idioma, Testnet, Freighter, Connect Wallet) se ven y se pueden tocar.
3. Toca el sol: todo pasa a claro y "Mexicano" se lee completo.
4. El ícono de la pestaña es el hexágono dorado, no el rayo de Vite.
5. Sin scroll horizontal.

> Nota: la barra tiene un botón para cambiar a **Mainnet**. El portafolio presenta Kivo como testnet; si no debe moverse dinero real, conviene ocultarlo. No lo toqué porque es funcionalidad.
