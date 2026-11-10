import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, SlidersHorizontal } from "lucide-react";
import { serverApi } from "../../lib/server";
import type { Option, Property } from "../../lib/types";
import { PropertyCard } from "../../components/property-card";
import { SearchForm } from "../../components/search-form";
export const metadata: Metadata = { title: "Propiedades en Trujillo" };
export const dynamic = "force-dynamic";
export default async function Catalog({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const params: Record<string, string> = {};
  for (const k of [
    "operation",
    "location",
    "category",
    "maxPrice",
    "minPrice",
    "q",
    "page",
    "sort",
  ])
    if (typeof raw[k] === "string" && raw[k] !== "") params[k] = raw[k] as string;
  const [result, locations, categories] = await Promise.all([
    serverApi<{
      items: Property[];
      total: number;
      pages: number;
      page: number;
    }>("properties?" + new URLSearchParams(params)),
    serverApi<Option[]>("locations"),
    serverApi<Option[]>("categories"),
  ]);
  const pageUrl = (page: number) =>
    "/propiedades?" + new URLSearchParams({ ...params, page: String(page) });
  return (
    <main id="contenido" className="interior-page catalog-page">
      <div className="section-wrap">
        <div className="page-intro" data-reveal>
          <p className="eyebrow">ESPACIOS CON LOS QUE CONECTAS</p>
          <h1>Encuentra tu lugar.</h1>
          <p>Casas y departamentos para la vida que quieres vivir.</p>
        </div>
        <SearchForm
          locations={locations}
          categories={categories}
          initial={params}
          compact
          key={JSON.stringify(params)}
        />
        <div className="catalog-toolbar">
          <p>
            {result.total}{" "}
            {result.total === 1 ? "espacio disponible" : "espacios disponibles"}{" "}
            <span>· Trujillo, Perú</span>
          </p>
          <div>
            <Link className="text-link" href="/propiedades">
              Limpiar filtros
            </Link>
            <form>
              <SlidersHorizontal size={15} />
              {Object.entries(params)
                .filter(([k]) => !["sort", "page"].includes(k))
                .map(([k, v]) => (
                  <input key={k} type="hidden" name={k} value={v} />
                ))}
              <select
                name="sort"
                defaultValue={params.sort || "newest"}
                aria-label="Ordenar propiedades"
              >
                <option value="newest">Selección HÁBITA</option>
                <option value="priceAsc">Menor precio</option>
                <option value="priceDesc">Mayor precio</option>
              </select>
              <button className="sort-submit" aria-label="Aplicar orden">
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>
        {result.items.length ? (
          <div className="property-grid">
            {result.items.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h2>Tu espacio aún está por descubrir.</h2>
            <p>
              No hay propiedades con estos filtros. Prueba otra ubicación o
              presupuesto.
            </p>
            <Link className="button sand" href="/propiedades">
              Ver todas las propiedades <ArrowRight size={18} />
            </Link>
          </div>
        )}
        {result.pages > 1 && (
          <nav className="pagination" aria-label="Páginas del catálogo">
            {result.page > 1 && (
              <Link href={pageUrl(result.page - 1)}>
                <ArrowLeft size={17} />
                Anterior
              </Link>
            )}
            <span>
              {result.page} / {result.pages}
            </span>
            {result.page < result.pages && (
              <Link href={pageUrl(result.page + 1)}>
                Siguiente
                <ArrowRight size={17} />
              </Link>
            )}
          </nav>
        )}
        <p className="demo-note">
          Selección de demostración · Precios, disponibilidad e imágenes
          ilustrativos.
        </p>
      </div>
    </main>
  );
}
