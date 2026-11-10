# Verificación de la entrega

Fecha: 8 de noviembre de 2026.

## Resultados comprobados

- TypeScript: `npm run typecheck` sin errores.
- Next.js 16.4.5: compilación optimizada terminada correctamente.
- NestJS 11: compilación TypeScript terminada correctamente.
- Astro 5: guía estática generada correctamente.
- Migración inicial aplicada a una base PostgreSQL real de pruebas, aislada de la base de desarrollo.
- `node scripts/verify.mjs`: **19 pruebas aprobadas, 0 fallidas y 0 omitidas** (incluye los dos grupos de pruebas).

### Integración del backend

Se comprobó conectividad SQL, catálogo y relaciones, alquiler/presupuesto, orden y filtros inválidos, ficha y 404, protección de datos privados, registro y sesión, restricciones de rol, favoritos idempotentes, consentimiento y persistencia de consultas, administración de propiedades, gestión de enlaces multimedia y rechazo de mutaciones sin JSON.

### Next compilado y conexión entre capas

Se comprobaron portada SSR; acceso HTTP a los archivos JavaScript y CSS generados; catálogo filtrado por alquiler/presupuesto; fichas, información, favoritos, administración, privacidad y Journal; respuesta HTTP 404 para una propiedad inexistente; fotografías, video y fuentes; y registro, sesión, favoritos y consultas a través del proxy `/api` de Next hacia NestJS.

La prueba crea una instancia temporal PostgreSQL, con credenciales aleatorias, y elimina únicamente los registros y el directorio que genera para su propia ejecución.

## Revisión visual y límites

Se abrió la portada en el navegador de pruebas y se revisó su captura de escritorio: arquitectura al atardecer, título en dos líneas, navegación en cápsula, tonos arena/carbón y buscador superpuesto. No se guardan capturas en el paquete.

En el primer arranque de desarrollo los clics de cambio de operación y apertura de sesión no mostraron el cambio esperado durante la observación. Después se ajustó el arranque para comprobar la versión compilada, se corrigió el entorno NODE_ENV de los procesos y se verificaron sus recursos y conexiones mediante HTTP. La continuación de la prueba en navegador fue bloqueada por una restricción de autoridad de URL del navegador de pruebas tras reiniciar el servidor. Por ello **no se da por resuelta ni aprobada la interacción completa en navegador**: sigue pendiente confirmar hidratación, clics, formularios, diálogos, reproducción y animaciones en esa versión.

La adaptación responsive está implementada mediante estilos y navegación móvil, pero **no se pudo completar la revisión visual en móvil/tablet ni una auditoría automatizada de accesibilidad, rendimiento o compatibilidad entre navegadores**. Las comprobaciones HTTP y de API no sustituyen estas revisiones.

## Alcance real

- No se publicó ni registró un Site y no se modificaron servicios externos.
- La migración de Supabase está documentada, no ejecutada.
- WhatsApp está preparado mediante configuración, pendiente de número comercial verificado.
- Las consultas se guardan en PostgreSQL; no se envían notificaciones externas.
- Los medios se gestionan mediante enlaces autorizados; no hay almacenamiento de archivos externo conectado.
- El video es movimiento de cámara sobre una fotografía generada, no una filmación.
- El catálogo es ilustrativo. No se publicaron testimonios ficticios.
- Antes de uso comercial deben completarse las revisiones pendientes y los requisitos operativos descritos en README.md.
