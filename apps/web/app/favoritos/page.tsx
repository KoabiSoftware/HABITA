"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Heart } from "lucide-react";
import { api, usePlatform, AccountPrompt } from "../../components/platform";
import { PropertyCard } from "../../components/property-card";
import type { Property } from "../../lib/types";
export default function Favorites() {
  const { user, favorites } = usePlatform();
  const [items, setItems] = useState<Property[]>([]),
    [loading, setLoading] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    if (!user) return;
    let live = true;
    setLoading(true);
    api<{ property: Property }[]>("favorites")
      .then((r) => {
        if (live) {
          setItems(r.map((f) => f.property));
          setError("");
        }
      })
      .catch((e) => {
        if (live) setError(e.message);
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [user, favorites]);
  return (
    <main id="contenido" className="interior-page section-wrap favorites-page">
      <div className="page-intro">
        <p className="eyebrow">ESPACIOS QUE QUIERES RECORDAR</p>
        <h1>Tu selección personal.</h1>
        <p>Un lugar para volver a los hogares que te inspiran.</p>
      </div>
      <AccountPrompt />
      {user &&
        (error ? (
          <p role="alert" className="form-error">
            {error}
          </p>
        ) : loading ? (
          <p role="status">Cargando tu selección…</p>
        ) : items.length ? (
          <div className="property-grid">
            {items.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Heart size={32} />
            <h2>Aquí empieza tu selección.</h2>
            <p>Guarda una propiedad con el corazón para encontrarla aquí.</p>
            <Link className="button sand" href="/propiedades">
              Explorar propiedades <ArrowUpRight size={18} />
            </Link>
          </div>
        ))}
    </main>
  );
}
