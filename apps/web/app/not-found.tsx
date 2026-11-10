import Link from "next/link";
export default function NotFound() {
  return (
    <main id="contenido" className="interior-page section-wrap empty-state">
      <p className="eyebrow">404 / CAMBIEMOS DE DIRECCIÓN</p>
      <h1>Este lugar no está disponible.</h1>
      <p>Explora el catálogo para descubrir otros espacios.</p>
      <Link className="button sand" href="/propiedades">
        Ver propiedades
      </Link>
    </main>
  );
}
