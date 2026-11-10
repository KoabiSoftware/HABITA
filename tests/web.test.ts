import { test } from "node:test";
import assert from "node:assert/strict";
const base = process.env.TEST_WEB_URL;
test(
  "Next compilado · rutas, recursos y proxy NestJS",
  { skip: !base },
  async (t) => {
    async function page(path: string) {
      const r = await fetch(base + path);
      return { status: r.status, body: await r.text() };
    }
    await t.test(
      "portada SSR y archivos JavaScript/CSS accesibles",
      async () => {
        const r = await page("/");
        assert.equal(r.status, 200);
        assert.match(r.body, /Un lugar a la/);
        assert.match(r.body, /Casa en El Golf/);
        assert.match(r.body, /class="hero-poster"[^>]*src="\/images\/hero.webp"/);
        assert.doesNotMatch(r.body, /<video|hero-film\.mp4/);
        assert.match(r.body, /Más cerca de lo que buscas/);
        assert.match(r.body, /class="journey-inner section-wrap"/);
        assert.equal((r.body.match(/class="journey-stage"/g) || []).length, 1);
        const resources = [
          ...r.body.matchAll(/(?:src|href)="([^\"]*\/_next\/static\/[^\"]+)"/g),
        ].map((m) => m[1].replaceAll("&amp;", "&"));
        assert.ok(resources.length > 3);
        for (const url of new Set(resources)) {
          const response = await fetch(base + url);
          assert.equal(response.status, 200, url);
          assert.ok((await response.text()).length > 10);
        }
      },
    );
    await t.test("catálogo SSR usa filtros reales de Nest", async () => {
      const r = await page("/propiedades?operation=RENT&maxPrice=2500");
      assert.equal(r.status, 200);
      assert.match(r.body, /Loft Terraza/);
      assert.match(
        r.body
          .replace(/<!--[\s\S]*?-->/g, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " "),
        /1 espacio disponible/,
      );
      assert.doesNotMatch(r.body, /Residencia Jardín/);
    });
    await t.test("formulario sin presupuesto conserva el catálogo de venta", async () => {
      const r = await page("/propiedades?operation=SALE&location=&category=&maxPrice=");
      assert.equal(r.status, 200);
      assert.match(r.body, /Casa en El Golf/);
      assert.match(r.body, /Departamento en California/);
      assert.match(r.body, /Departamento en Víctor Larco/);
    });
    await t.test("navegación y footer compartidos incluyen Inicio en todas las páginas", async () => {
      let previousHeader = "";
      let previousFooter = "";
      for (const route of [
        "/", "/propiedades", "/nosotros", "/contacto",
        "/favoritos", "/administracion", "/privacidad",
      ]) {
        const { body } = await page(route);
        const header = body.match(/<header\b[\s\S]*?<\/header>/)?.[0] || "";
        const footer = body.match(/<footer\b[\s\S]*?<\/footer>/)?.[0] || "";
        assert.match(header, /class="navigation"/);
        assert.match(header, /href="\/"[^>]*>Inicio<\/a>/);
        assert.match(footer, /class="site-footer"/);
        assert.equal((body.match(/class="footer-invitation"/g) || []).length, 1);
        assert.match(footer, /Conversemos sobre tu/);
        assert.match(footer, /aria-label="Conversemos sobre tu próximo hogar\."/);
        assert.ok((footer.match(/class="invitation-char"/g) || []).length > 20);
        assert.match(footer, /class="footer-more"/);
        if (route !== "/") assert.doesNotMatch(body, /class="journey-stage"/);
        const normalized = header
          .replace(/class="active"/g, 'class=""')
          .replace(/ aria-current="page"/g, "");
        if (previousHeader) assert.equal(normalized, previousHeader);
        if (previousFooter) assert.equal(footer, previousFooter);
        previousHeader = normalized;
        previousFooter = footer;
      }
    });
    await t.test(
      "detalle, contenido editorial y rutas de información completas",
      async () => {
        for (const path of [
          "/propiedades/casa-en-el-golf",
          "/contacto",
          "/nosotros",
          "/favoritos",
          "/administracion",
          "/privacidad",
          "/journal/index.html",
        ]) {
          const r = await page(path);
          assert.equal(r.status, 200, path);
          assert.ok(r.body.length > 500, path);
        }
        assert.equal(
          (await page("/propiedades/inmueble-inexistente")).status,
          404,
        );
      },
    );
    await t.test(
      "fotografías, video y fuentes servidos desde el proyecto",
      async () => {
        for (const path of [
          "/images/hero.webp",
          "/images/hero-film.mp4",
          "/images/casa-card.webp",
          "/images/california-card.webp",
          "/images/larco-card.webp",
          "/images/nosotros.webp",
          "/fonts/manrope-0.ttf",
        ]) {
          const r = await fetch(base + path);
          assert.equal(r.status, 200, path);
          assert.ok((await r.arrayBuffer()).byteLength > 1000, path);
        }
      },
    );
    await t.test(
      "sesión, favoritos y contacto atraviesan el proxy de Next",
      async () => {
        const email = `proxy-${Date.now()}@habita.test`;
        let r = await fetch(base + "/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password: "Proxy-test-secret-2026",
            name: "Usuario proxy",
          }),
        });
        assert.equal(r.status, 201);
        const cookie = r.headers.get("set-cookie")?.split(";")[0] || "";
        assert.match(r.headers.get("set-cookie") || "", /httponly/i);
        r = await fetch(base + "/api/auth/me", { headers: { Cookie: cookie } });
        assert.equal((await r.json()).email, email);
        const catalog = await (await fetch(base + "/api/properties")).json();
        const id = catalog.items[0].id;
        r = await fetch(base + "/api/favorites/" + id, {
          method: "POST",
          headers: { Cookie: cookie, "Content-Type": "application/json" },
          body: "{}",
        });
        assert.equal(r.status, 201);
        r = await fetch(base + "/api/favorites", {
          headers: { Cookie: cookie },
        });
        assert.equal((await r.json()).length, 1);
        r = await fetch(base + "/api/inquiries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Consulta proxy",
            email,
            phone: "+51 999 000 000",
            message: "Solicitud de prueba mediante el frontend.",
            consent: true,
            propertyId: id,
          }),
        });
        assert.equal(r.status, 201);
        assert.ok((await r.json()).id);
      },
    );
  },
);
