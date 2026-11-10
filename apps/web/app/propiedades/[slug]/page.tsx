import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  BedDouble,
  Bath,
  Scan,
  CarFront,
  Check,
  ArrowUpRight,
} from "lucide-react";
import { serverApi } from "../../../lib/server";
import type { Property } from "../../../lib/types";
import { price } from "../../../components/property-card";
import { FavoriteButton } from "../../../components/platform";
import { ContactForm, WhatsAppLink } from "../../../components/contact-form";
import { Gallery } from "../../../components/gallery";
export const dynamic = "force-dynamic";
async function getProperty(slug: string) {
  const res = await fetch(
    `${process.env.API_URL || "http://127.0.0.1:4000"}/api/properties/${encodeURIComponent(slug)}`,
    { cache: "no-store" },
  );
  if (res.status === 404) notFound();
  if (!res.ok) throw Error("No pudimos cargar esta propiedad.");
  return res.json() as Promise<Property>;
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const p = await getProperty((await params).slug);
  return {
    title: p.title,
    description: p.description.slice(0, 155),
    openGraph: { images: p.media[0] ? [p.media[0].url] : [] },
  };
}
export default async function Detail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const p = await getProperty((await params).slug);
  return (
    <main id="contenido" className="interior-page detail-page section-wrap">
      <Link href="/propiedades" className="text-link back-link">
        <ArrowLeft size={16} />
        Volver a propiedades
      </Link>
      <div className="detail-heading" data-reveal>
        <div>
          <p className="eyebrow">
            {p.category.name} /{" "}
            {p.operation === "SALE" ? "EN VENTA" : "EN ALQUILER"} /{" "}
            {p.status === "RESERVED" ? "RESERVADO" : "DISPONIBLE"}
          </p>
          <h1>{p.title}</h1>
          <p>
            <MapPin size={16} />
            {p.location.name}, {p.location.city}, Perú
          </p>
        </div>
        <div className="detail-price">
          <strong>{price(p.price)}</strong>
          {p.operation === "RENT" && <span>al mes</span>}
          <FavoriteButton id={p.id} />
        </div>
      </div>
      <Gallery media={p.media} />
      {p.media
        .filter((m) => m.kind === "VIDEO")
        .map((m) => (
          <video
            className="property-film"
            key={m.id}
            controls
            playsInline
            preload="none"
            aria-label={m.alt}
          >
            <source src={m.url} />
          </video>
        ))}
      <div className="detail-columns">
        <article>
          <div className="detail-specs">
            {[
              [BedDouble, p.bedrooms + " dormitorios"],
              [Bath, p.bathrooms + " baños"],
              [Scan, p.area + " m²"],
              [CarFront, p.parking + " estacionamientos"],
            ].map(([Icon, text], i) => {
              const I = Icon as typeof BedDouble;
              return (
                <div key={i}>
                  <I strokeWidth={1} />
                  <span>{text as string}</span>
                </div>
              );
            })}
          </div>
          <p className="eyebrow">UN ESPACIO PARA TU SIGUIENTE ETAPA</p>
          <h2>
            La vida se disfruta
            <br />
            en los detalles.
          </h2>
          <p className="description">{p.description}</p>
          <h3>Lo que hace especial este lugar</h3>
          <ul className="amenities">
            {p.amenities.map((a) => (
              <li key={a}>
                <Check size={16} />
                {a}
              </li>
            ))}
          </ul>
          <div className="location-panel">
            <MapPin size={26} />
            <div>
              <h3>El entorno también importa.</h3>
              <p>{p.address}</p>
              <small>
                Ubicación referencial de demostración. La dirección exacta se
                confirma al coordinar la visita.
              </small>
            </div>
          </div>
          <p className="demo-note">
            Fotografía generada para esta demostración. No representa un
            inmueble comercializado.
          </p>
        </article>
        <aside className="inquiry-panel" id="consulta">
          <p className="eyebrow">HABLEMOS DE ESTE ESPACIO</p>
          <h2>¿Te imaginas aquí?</h2>
          <p className="muted">
            Déjanos tus datos para solicitar información o coordinar una visita.
          </p>
          <ContactForm propertyId={p.id} propertyTitle={p.title} />
          <WhatsAppLink title={p.title} />
        </aside>
      </div>
    </main>
  );
}
