import { test } from "node:test";
import assert from "node:assert/strict";

const base = process.env.TEST_API_URL;

test("Property search filters use real catalog data", { skip: !base }, async (t) => {
  async function search(query: string) {
    const response = await fetch(`${base}/properties?${query}`);
    assert.equal(response.status, 200);
    return response.json();
  }
  const sales = await search("operation=SALE");
  assert.ok(sales.total > 0);

  await t.test("empty and whitespace-only budgets do not become zero", async () => {
    for (const bounds of ["maxPrice=", "maxPrice=%20", "minPrice=&maxPrice="]) {
      const result = await search(`operation=SALE&location=&category=&${bounds}`);
      assert.equal(result.total, sales.total);
    }
  });

  await t.test("location, category and budget work together", async () => {
    const selected = sales.items[0];
    const params = new URLSearchParams({
      operation: "SALE",
      location: selected.location.id,
      category: selected.category.id,
      maxPrice: String(selected.price),
    });
    const result = await search(params.toString());
    assert.ok(result.items.some((p: any) => p.id === selected.id));
    for (const property of result.items) {
      assert.equal(property.location.id, selected.location.id);
      assert.equal(property.category.id, selected.category.id);
      assert.ok(Number(property.price) <= Number(selected.price));
    }
  });

  await t.test("rental operation and budget exclude sale listings", async () => {
    const result = await search("operation=RENT&maxPrice=2500");
    assert.ok(result.total > 0);
    for (const property of result.items) {
      assert.equal(property.operation, "RENT");
      assert.ok(Number(property.price) <= 2500);
    }
  });

  await t.test("explicit zero remains a real price bound", async () => {
    assert.equal((await search("operation=SALE&maxPrice=0")).total, 0);
  });

  await t.test("invalid nonempty price bounds are rejected", async () => {
    for (const maxPrice of ["-1", "not-a-number"]) {
      const response = await fetch(`${base}/properties?maxPrice=${maxPrice}`);
      assert.equal(response.status, 400);
    }
  });
});
