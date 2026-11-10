import { test } from "node:test";
import assert from "node:assert/strict";
const base = process.env.TEST_API_URL || "http://127.0.0.1:4000/api";
let userCookie = "",
  adminCookie = "",
  propertyId = "",
  slug = "";
const email = `visitor-${Date.now()}@habita.test`,
  password = "Private-qa-password-29";
async function request(path: string, method = "GET", data?: any, cookie = "") {
  const r = await fetch(base + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    ...(data !== undefined ? { body: JSON.stringify(data) } : {}),
  });
  return {
    status: r.status,
    body: await r.json(),
    cookie: r.headers.get("set-cookie")?.split(";")[0] || "",
  };
}
test("Plataforma inmobiliaria · PostgreSQL y API real", async (t) => {
  await t.test("salud verifica la conexión a PostgreSQL", async () => {
    const r = await request("/health");
    assert.equal(r.status, 200);
    assert.equal(r.body.database, "postgresql");
  });
  await t.test(
    "catálogo y relaciones de imágenes, ubicación y categoría",
    async () => {
      const r = await request("/properties?operation=SALE");
      assert.equal(r.status, 200);
      assert.equal(r.body.total, 3);
      const p = r.body.items[0];
      propertyId = p.id;
      slug = p.slug;
      assert.ok(p.media[0].url);
      assert.ok(p.location.name);
      assert.ok(p.category.name);
    },
  );
  await t.test(
    "filtros de alquiler y presupuesto se ejecutan en base de datos",
    async () => {
      const r = await request("/properties?operation=RENT&maxPrice=3000");
      assert.equal(r.body.total, 1);
      assert.equal(r.body.items[0].operation, "RENT");
      assert.ok(Number(r.body.items[0].price) <= 3000);
    },
  );
  await t.test("búsqueda vacía, orden y validación de filtros", async () => {
    assert.equal((await request("/properties?maxPrice=1")).body.total, 0);
    assert.equal((await request("/properties?page=-1")).status, 400);
    assert.equal((await request("/properties?operation=INVALID")).status, 400);
    const { body } = await request("/properties?sort=priceAsc");
    assert.ok(Number(body.items[0].price) <= Number(body.items.at(-1).price));
  });
  await t.test("ficha por slug y propiedad inexistente", async () => {
    assert.equal((await request("/properties/" + slug)).body.id, propertyId);
    assert.equal((await request("/properties/no-existe")).status, 404);
  });
  await t.test("sesión requerida para datos privados", async () => {
    assert.equal((await request("/favorites")).status, 401);
    assert.equal((await request("/admin/properties")).status, 401);
    assert.equal((await request("/inquiries")).status, 401);
  });
  await t.test(
    "registro crea usuario y cookie HttpOnly de sesión",
    async () => {
      const r = await request("/auth/register", "POST", {
        email,
        password,
        name: "Visitante de prueba",
      });
      assert.equal(r.status, 201);
      userCookie = r.cookie;
      assert.ok(userCookie);
      assert.equal(r.body.role, "USER");
      assert.equal(r.body.passwordHash, undefined);
      assert.equal(
        (await request("/auth/me", "GET", undefined, userCookie)).body.email,
        email,
      );
    },
  );
  await t.test(
    "usuario no puede elevar su rol ni acceder a administración",
    async () => {
      assert.equal(
        (await request("/admin/properties", "GET", undefined, userCookie))
          .status,
        403,
      );
      assert.equal(
        (
          await request("/auth/register", "POST", {
            email: "bad@habita.test",
            password,
            name: "Prueba",
            role: "ADMIN",
          })
        ).status,
        400,
      );
      assert.equal(
        (
          await request("/auth/login", "POST", {
            email,
            password: "wrong-password",
          })
        ).status,
        401,
      );
    },
  );
  await t.test(
    "favoritos persisten, son idempotentes y se eliminan",
    async () => {
      assert.equal(
        (await request("/favorites/" + propertyId, "POST", {}, userCookie))
          .status,
        201,
      );
      await request("/favorites/" + propertyId, "POST", {}, userCookie);
      let r = await request("/favorites", "GET", undefined, userCookie);
      assert.equal(r.body.length, 1);
      assert.equal(r.body[0].property.id, propertyId);
      await request("/favorites/" + propertyId, "DELETE", {}, userCookie);
      assert.equal(
        (await request("/favorites", "GET", undefined, userCookie)).body.length,
        0,
      );
    },
  );
  await t.test(
    "contacto valida consentimiento y guarda solicitud real",
    async () => {
      const data = {
        name: "Consulta de prueba",
        email,
        phone: "+51 999 000 000",
        message: "Quisiera coordinar una visita a esta propiedad.",
        propertyId,
        consent: false,
      };
      assert.equal((await request("/inquiries", "POST", data)).status, 400);
      const r = await request("/inquiries", "POST", { ...data, consent: true });
      assert.equal(r.status, 201);
      assert.ok(r.body.id);
    },
  );
  await t.test(
    "administrador puede leer consultas y gestionar propiedades y medios",
    async () => {
      let r = await request("/auth/login", "POST", {
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
      });
      assert.equal(r.status, 201);
      adminCookie = r.cookie;
      assert.ok(
        (await request("/inquiries", "GET", undefined, adminCookie)).body.some(
          (i: any) => i.email === email,
        ),
      );
      const p = (await request("/properties/" + slug)).body;
      const data = {
        title: "Casa verificación",
        slug: "casa-verificacion",
        description:
          "Propiedad temporal para comprobar el flujo de administración.",
        price: 999999,
        area: 100,
        bedrooms: 2,
        bathrooms: 2,
        parking: 1,
        operation: "SALE",
        status: "AVAILABLE",
        featured: false,
        amenities: ["Jardín"],
        address: "Zona de prueba",
        categoryId: p.categoryId,
        locationId: p.locationId,
      };
      r = await request("/admin/properties", "POST", data, adminCookie);
      assert.equal(r.status, 201);
      const id = r.body.id;
      assert.equal(
        (
          await request(
            "/admin/properties/" + id,
            "PATCH",
            { ...data, title: "Casa actualizada" },
            adminCookie,
          )
        ).body.title,
        "Casa actualizada",
      );
      let m = await request(
        "/media",
        "POST",
        {
          propertyId: id,
          url: "/images/casa.webp",
          alt: "Imagen de la casa de prueba",
          kind: "IMAGE",
          position: 0,
        },
        adminCookie,
      );
      assert.equal(m.status, 201);
      assert.equal(
        (await request("/media/" + id, "GET", undefined, adminCookie)).body
          .length,
        1,
      );
      assert.equal(
        (await request("/media/" + m.body.id, "DELETE", {}, adminCookie))
          .status,
        200,
      );
      assert.equal(
        (await request("/admin/properties/" + id, "DELETE", {}, adminCookie))
          .status,
        200,
      );
      assert.equal(
        (await request("/properties/casa-verificacion")).status,
        404,
      );
    },
  );
  await t.test(
    "JSON obligatorio en mutaciones protege contra formularios externos",
    async () => {
      const r = await fetch(base + "/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: "{}",
      });
      assert.equal(r.status, 415);
    },
  );
});
