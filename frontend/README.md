# frontend — componente web

Sitio público y panel de administración de Plisados Roldán. Angular 22 con renderizado en el
servidor (SSR), TypeScript estricto. Ver el [README principal](../README.md) para la arquitectura
completa.

- Es la **única entrada pública**: renderiza las páginas en el servidor (SEO y vistas previas de
  WhatsApp) y reenvía `/api`, `/media` y `/sitemap.xml` al componente backend.
- Las páginas públicas se renderizan en cada petición; `/admin` se renderiza solo en el navegador.
- Los tipos de la API (`src/app/core/api/generated/`) se **generan** desde el contrato
  `../specs/001-business-info-site/contracts/openapi.yaml`; no se editan a mano.

## Ejecutar en desarrollo

Con el backend corriendo en `localhost:8080` (ver `../backend/README.md`):

```bash
npm install
npm start                    # http://localhost:4200
```

## Comprobaciones

```bash
npm run lint                 # ESLint + contract:check (tipos al día con el contrato)
npm test                     # pruebas unitarias
npm run contract:generate    # regenerar los tipos cuando cambie el contrato
```

### Pruebas extremo a extremo

```bash
cd e2e && npm install && npx playwright install chromium
E2E_ADMIN_PASSWORD=<tu ADMIN_PASSWORD> npx playwright test
# contra el stack completo: E2E_BASE_URL=http://localhost:4000
```

Cubren el flujo del visitante, la administración, casos de éxito y testimonios, SEO sin
JavaScript y accesibilidad (axe, WCAG 2.1 AA), en móvil y escritorio. Corren una prueba a la vez
porque comparten la base de datos, y borran todo lo que crean.

## Imagen

`Dockerfile` multi-etapa: construye el bundle SSR y lo ejecuta en Node 24 con el usuario `node`.
Variables: `API_INTERNAL_URL` (dirección interna del backend) y `NG_ALLOWED_HOSTS` (dominios
aceptados por el servidor SSR).
