# HÁBITA · Plataforma inmobiliaria

Implementación local de la referencia visual aportada: fondo carbón, acentos arena, navegación fija en cápsula, arquitectura al atardecer, buscador flotante, selección de tres propiedades y bloque de acompañamiento. No se ha registrado ni publicado un Site ni modificado servicios externos.

## Arranque rápido

Requisitos: Node.js 22.13+ (verificado con Node 24), npm y una plataforma compatible con `embedded-postgres`. No ejecutes PostgreSQL como root. No se incluyen credenciales ni datos personales en el paquete.

```bash
npm ci
npm run dev
```

El comando crea una base **PostgreSQL real**, persistente y local en `.local/postgres`, genera secretos aleatorios en `.env` si no existe, aplica la migración local, carga el catálogo ilustrativo, compila NestJS/Astro/Next y sirve la aplicación. Abre `http://localhost:3000` fuera del entorno gestionado de Sites. La API escucha solo en `127.0.0.1:4000`; el frontend la publica bajo `/api` mediante rewrites, sin CORS ni claves de base de datos en el navegador. Detén el proceso con Ctrl+C. El arranque ejecuta la versión compilada de Next para revisar el comportamiento de producción.

El arranque genera Prisma automáticamente y funciona en Windows sin depender de `npm.cmd` ni de conversiones manuales de rutas. Para cambiar el puerto web: `npm run dev -- --port 3001`. Si PostgreSQL ya ocupa `5433`, cambia únicamente el puerto de `DATABASE_URL` y `DIRECT_URL` en `.env` por uno libre, conservando la contraseña del clúster existente. No detengas bases de otros proyectos.

La primera instalación descarga binarios de PostgreSQL desde el registro de paquetes. Para usar tu propio PostgreSQL consulta la alternativa siguiente. No se inicia ni modifica ninguna instancia externa automáticamente.

## PostgreSQL con Docker o una instancia propia

1. Copia `.env.example` a `.env` y define `DATABASE_URL`, `DIRECT_URL` y un `JWT_SECRET` aleatorio de al menos 32 caracteres.
2. Para Docker define además `POSTGRES_PASSWORD`; ejecuta `docker compose up -d db`. Usa la misma contraseña en las dos URL. El puerto local es 5433.
3. Ejecuta el arranque con `HABITA_EXTERNAL_DB=1 npm run dev` (en PowerShell: `$env:HABITA_EXTERNAL_DB="1"; npm run dev`). Este modo **aplica migraciones a la base configurada**. Úsalo solo con una base de desarrollo vacía y autorizada.
4. `npm run db:migrate` aplica las migraciones versionadas. `npm run db:seed` carga datos de ejemplo de manera idempotente. Ninguno se debe ejecutar sobre producción sin revisión y autorización.

Para iterar sobre Next con recarga puedes mantener PostgreSQL y Nest iniciados y ejecutar `npm run dev -w @habita/web` en otro puerto. La compilación de Nest utiliza TypeScript con metadatos de decoradores; no se ejecuta Nest directamente con el transformador de tsx.

## Arquitectura

| Directorio          | Responsabilidad                                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------------------------ |
| `apps/web`          | Next.js App Router y TypeScript. SSR de catálogo/fichas, componentes interactivos, formularios y navegación. |
| `apps/api`          | NestJS: módulos, controladores, servicios, DTOs, validación, autorización y consultas.                       |
| `packages/database` | Esquema Prisma, migración PostgreSQL y seed ilustrativo.                                                     |
| `apps/editorial`    | Astro genera solamente `/journal/index.html`, una guía editorial sin JavaScript de cliente.                  |
| `scripts`           | Arranque local, PostgreSQL y verificación aislada.                                                           |
| `tests`             | Pruebas de integración de la API sobre PostgreSQL real.                                                      |

**Justificación de Astro:** la guía de búsqueda es contenido editorial independiente y estático. Astro la genera en `apps/web/public/journal`, y Next sirve los archivos resultantes. No hay dos routers de aplicación, dos implementaciones de componentes interactivos ni duplicación de acceso a datos. El catálogo y la autenticación pertenecen exclusivamente a Next + Nest.

## Rutas e interacciones

- `/`: referencia adaptada a web, imagen `hero.webp`, buscador y propiedades destacadas.
- `/propiedades`: filtros en URL por ubicación, tipo, operación y presupuesto; orden de precios, resultados vacíos y paginación. La API admite además `minPrice` y `q`.
- `/propiedades/[slug]`: datos de Prisma, características, galería ampliable con teclado y consulta vinculada al inmueble.
- `/nosotros`: propuesta, servicios y espacio explícito para testimonios futuros verificados.
- `/contacto`: validación de datos y consentimiento, guardado real y código de referencia de la solicitud.
- `/favoritos`: registro/inicio de sesión y favoritos privados persistentes.
- `/administracion`: acceso exclusivo ADMIN, creación/edición, archivo reversible, gestión de enlaces de imágenes y lectura de consultas.
- `/privacidad`: tratamiento de datos en la demostración y puntos que debe completar el responsable antes de comercializar.
- `/journal/index.html`: guía editorial generada por Astro.
- Rutas de error y 404; estados de carga en las funciones de cuenta.

Los botones de compra/alquiler y la búsqueda realizan consultas reales. Las solicitudes quedan en la base y se consultan en administración; no se simula el envío de un correo. El catálogo solo muestra estados AVAILABLE o RESERVED. Archivar una propiedad la retira del catálogo y conserva sus datos.

## Administración

No hay una contraseña predeterminada ni un administrador público. Define en `.env`:

```dotenv
ADMIN_EMAIL=tu-correo-verificado
ADMIN_PASSWORD=una-clave-aleatoria-de-al-menos-14-caracteres
```

Al reiniciar el entorno, el seed crea la cuenta si no existe (no sobrescribe claves existentes). Inicia sesión con el icono de usuario y abre `/administracion`. El registro público siempre crea USER. Los guardias verifican el rol actual en PostgreSQL, no un rol recibido desde el cliente.

## API

| Método / ruta bajo `/api`                                          | Acceso  | Función                                 |
| ------------------------------------------------------------------ | ------- | --------------------------------------- |
| `GET /health`                                                      | Público | Consulta SQL de conectividad.           |
| `GET /properties`                                                  | Público | Filtros validados, orden y paginación.  |
| `GET /properties/:slug`                                            | Público | Ficha disponible y relaciones.          |
| `GET /locations`, `GET /categories`                                | Público | Catálogos relacionales.                 |
| `POST /auth/register`, `/auth/login`, `/auth/logout`               | Público | Sesiones de cuenta.                     |
| `GET /auth/me`, `/users/me`                                        | Sesión  | Perfil sin hash de contraseña.          |
| `GET /favorites`, `POST /favorites/:id`, `DELETE /favorites/:id`   | Sesión  | Selección persistente e idempotente.    |
| `POST /inquiries`                                                  | Público | Registro validado con consentimiento.   |
| `GET /inquiries`                                                   | ADMIN   | Últimas 100 consultas privadas.         |
| `GET/POST /admin/properties`, `PATCH/DELETE /admin/properties/:id` | ADMIN   | Gestión de propiedades; DELETE archiva. |
| `GET /media/:propertyId`, `POST /media`, `DELETE /media/:id`       | ADMIN   | Metadatos y enlaces de recursos.        |

Modelos: User (USER/AGENT/ADMIN), Property, Category, Location, Media, Inquiry y Favorite. Hay índices de búsqueda, unicidad de correo/slug/favorito, claves foráneas, precios Decimal y políticas de borrado. El modelo contempla un agente opcional por propiedad; no incluye todavía una interfaz de gestión de agentes, CRM o reportes avanzados.

## Diseño, movimiento y medios

- Cinco fotografías originales generadas para este proyecto; WebP optimizado y variantes ligeras para tarjetas.
- El hero utiliza exclusivamente `hero.webp`, con prioridad de carga alta; no descarga ni reproduce video. El MP4 anterior se conserva como recurso, sin utilizarse en la portada.
- GSAP: revelado de líneas del titular, aparición de secciones, parallax con ScrollTrigger, transición de la navegación fija y entrada escalonada del footer al llegar con scroll.
- Tarjetas: perspectiva 3D sutil, elevación, zoom contenido y acción superpuesta. Botones magnéticos solo con puntero fino.
- El cursor nativo se conserva por accesibilidad. No se añade Three.js porque el diseño no requiere una escena WebGL ni su coste de descarga.
- `prefers-reduced-motion` evita las animaciones; la navegación y el contenido del footer permanecen visibles.
- Fuentes Manrope alojadas localmente y fallback de sistema; no se consulta Google Fonts al navegar.
- Puntos de adaptación para móvil, tablet y escritorio, navegación colapsada y formularios accesibles.
- Escala compacta compartida: contenido de hasta 1120 px, tarjetas y tipografía acotadas, hero ajustado al alto disponible y buscador dentro de la primera pantalla. La navegación mantiene el mismo diseño en todas las rutas e incluye Inicio junto al logo HÁBITA.
- Los desplegables de búsqueda usan opciones oscuras y controles nativos accesibles. Un presupuesto vacío significa sin límite; cambiar entre compra y alquiler reinicia el presupuesto.
- El acompañamiento y el footer horizontal conservan el fondo carbón. Solo el acompañamiento de inicio se eleva con el scroll como una tarjeta de esquinas superiores redondeadas, sin fijar ni bloquear el resto de la página. La invitación recupera su fondo marrón y revela el título letra por letra; el texto completo permanece disponible para lectores de pantalla, sin JavaScript y con movimiento reducido. Favoritos, cuenta, Privacidad y Journal siguen accesibles en «Más».

Los datos, precios y fotografías son de demostración; las descripciones lo aclaran. No se inventaron clientes, testimonios, estadísticas ni teléfonos de empresa.

## WhatsApp y contacto comercial

`NEXT_PUBLIC_WHATSAPP_NUMBER` acepta únicamente dígitos con código de país. Con un número verificado genera un enlace `wa.me` con el mensaje y la propiedad; requiere recompilar Next por ser una variable pública. Mientras esté vacío muestra una nota informativa y el formulario sigue funcionando. No se envían mensajes automáticamente. Tampoco se configura correo transaccional sin un proveedor y autorización.

## Supabase, sin migración ejecutada

Prisma utiliza el conector `postgresql`; el esquema no depende de un proveedor. Para una futura migración autorizada:

1. Crear un proyecto Supabase y un usuario de base con privilegios mínimos para el backend.
2. Definir `DATABASE_URL` con la conexión de aplicación apropiada y `DIRECT_URL` con la conexión directa para migraciones. Revisar SSL/pooler según el despliegue elegido.
3. Respaldar y transferir los datos mediante un procedimiento revisado; después aplicar las migraciones a la instancia autorizada. No basta con cambiar la URL para trasladar los registros existentes.
4. Mantener JWT y Prisma en NestJS. No exponer credenciales PostgreSQL ni claves privilegiadas en el navegador. No activar la API pública de tablas sin diseñar políticas RLS.
5. Si se adopta Supabase Auth o Storage, crear adaptadores específicos; no están conectados ni declarados como funcionales en esta entrega.

Fuentes técnicas: [Next rewrites](https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites), [Astro static output](https://docs.astro.build/en/reference/configuration-reference/), [Prisma v6 y Supabase](https://www.prisma.io/docs/orm/v6/overview/databases/supabase), [conexiones PostgreSQL de Supabase](https://supabase.com/docs/guides/database/connecting-to-postgres).

## Verificación

```bash
npm run typecheck
npm run build
node scripts/verify.mjs
```

`verify.mjs` crea una instancia PostgreSQL aislada en el puerto 5544, aplica la migración, carga datos de prueba, inicia NestJS y ejecuta las pruebas de integración y comprobación HTTP. Elimina únicamente su directorio temporal de pruebas al terminar. No toca la base de desarrollo ni servicios externos.

El informe de la entrega está en `docs/VALIDACION.md`.

## Publicación pendiente

No se ejecutaron despliegues, migraciones de producción, registro de Sites, pushes a repositorios externos ni cambios en Supabase. El runtime alojado de Sites usa Cloudflare Workers; el servidor NestJS con PostgreSQL necesita un host Node/servicio independiente o una adaptación de infraestructura revisada. Este monorepo conserva el stack solicitado y no pretende que Nest se ejecute directamente dentro de un Worker.

Antes de un uso comercial hacen falta dominio y entorno de alojamiento, contactos comerciales verificados, propiedades reales autorizadas, configuración de correo/WhatsApp, responsable de privacidad, backups/monitorización, verificación de correo, recuperación de contraseña y revisión de seguridad/carga. La entrega es una plataforma local funcional, no una certificación de preparación para producción.
