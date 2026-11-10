import Link from "next/link";
import {
  ArrowUpRight,
  Search,
  CalendarDays,
  House,
} from "lucide-react";
import { PropertyCard } from "../components/property-card";
import { SearchForm } from "../components/search-form";
import { serverApi } from "../lib/server";
import type { Property, Option } from "../lib/types";
export const dynamic = "force-dynamic";
export default async function Home() {
  const [properties, locations, categories] = await Promise.all([
    serverApi<{ items: Property[] }>("properties?operation=SALE&limit=3"),
    serverApi<Option[]>("locations"),
    serverApi<Option[]>("categories"),
  ]);
  return (
    <main id="contenido" className="home-page">
      <section className="hero">
        <div className="hero-visual">
          <img
            className="hero-poster"
            src="/images/hero.webp"
            alt="Residencia contemporánea de concreto y vidrio iluminada al atardecer"
            width={1672}
            height={941}
            fetchPriority="high"
          />
        </div>
        <div className="hero-shade" />
        <div className="hero-copy">
          <p className="eyebrow light">
            ESPACIOS QUE INSPIRAN <i />
          </p>
          <h1 className="hero-title">
            <span>Un lugar a la{" "}</span>
            <span>altura de tu vida.</span>
          </h1>
          <Link className="button sand magnetic" href="/propiedades">
            Explorar propiedades
          </Link>
        </div>
        <div className="search-placement">
          <SearchForm locations={locations} categories={categories} />
        </div>
      </section>
      <section className="featured section-wrap" id="destacadas">
        <div className="section-heading" data-reveal>
          <div>
            <h2>Propiedades que destacan</h2>
          </div>
        </div>
        <div className="property-grid">
          {properties.items.map((p, i) => (
            <PropertyCard key={p.id} property={p} index={i} />
          ))}
        </div>
      </section>
      <div className="journey-stage" data-journey-stage>
        <section
          className="journey"
          id="nosotros"
          aria-labelledby="journey-title"
          data-journey-card
        >
          <div className="journey-inner section-wrap">
            <div className="journey-image">
              <img
                src="/images/nosotros.webp"
                alt="Sala de tonos naturales con ventanales abiertos a un jardín privado"
                loading="lazy"
                width={1200}
                height={800}
              />
            </div>
            <div className="journey-content">
              <h2 id="journey-title">Más cerca de lo que buscas.</h2>
              <p className="journey-description">
                Te acompañamos en cada paso para que encuentres el espacio ideal,
                con un servicio cercano, claro y a tu ritmo.
              </p>
              <div className="steps">
                {[
                  { icon: House, title: "Compra con orientación", href: "/contacto" },
                  { icon: CalendarDays, title: "Agenda una visita", href: "/contacto" },
                  { icon: Search, title: "Encuentra tu espacio", href: "/propiedades" },
                ].map((step) => (
                  <Link href={step.href} className="step" key={step.title}>
                    <step.icon strokeWidth={1.2} />
                    <span>{step.title}</span>
                    <ArrowUpRight className="step-arrow" size={15} />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
