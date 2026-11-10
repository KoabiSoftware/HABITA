import Link from "next/link";
import { BedDouble, Bath, Scan, ArrowUpRight } from "lucide-react";
import { FavoriteButton } from "./platform";
import type { Property } from "../lib/types";
export const price = (value: string | number) =>
  "S/ " + Number(value).toLocaleString("en-US", { maximumFractionDigits: 0 });
export function PropertyCard({
  property: p,
  index = 0,
}: {
  property: Property;
  index?: number;
}) {
  return (
    <article className="property-card" data-reveal>
      <div className="card-image-wrap">
        <Link
          href={"/propiedades/" + p.slug}
          className="card-image"
          aria-label={"Ver " + p.title}
        >
          {p.media[0] ? (
            <img
              src={p.media[0].url}
              srcSet={
                /^\/images\/(casa|california|larco|hero)\.webp$/.test(
                  p.media[0].url,
                )
                  ? `${p.media[0].url.replace(".webp", "-card.webp")} 750w, ${p.media[0].url} 1536w`
                  : undefined
              }
              sizes="(max-width: 760px) 88vw, 29vw"
              alt={p.media[0].alt}
              loading="lazy"
              width={600}
              height={400}
            />
          ) : (
            <div className="image-pending">Fotografía en preparación</div>
          )}
          <span className="card-visit">
            Conoce este espacio <ArrowUpRight size={17} />
          </span>
        </Link>
        <span className="operation-badge">
          {p.operation === "SALE" ? "EN VENTA" : "EN ALQUILER"}
        </span>
        <FavoriteButton id={p.id} />
      </div>
      <div className="card-content">
        <Link href={"/propiedades/" + p.slug}>
          <h3>{p.title}</h3>
        </Link>
        <p className="card-location">
          {p.location.city} <span>·</span> {p.bedrooms} dorm. <span>·</span> {p.area} m²
        </p>
        <p className="card-price">
          {price(p.price)}
          {p.operation === "RENT" && <small> / mes</small>}
        </p>
        <div className="card-specs">
          <span>
            <BedDouble />
            {p.bedrooms} dorm.
          </span>
          <span>
            <Bath />
            {p.bathrooms} baños
          </span>
          <span>
            <Scan />
            {p.area} m²
          </span>
        </div>
      </div>
    </article>
  );
}
