import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = { title: "Propiedades en Trujillo" };
export default function PropertiesInformation() {
  return (
    <main id="contenido" className="interior-page section-wrap">
      <div className="page-intro" data-reveal>
        <p className="eyebrow">INFORMACIÓN INMOBILIARIA</p>
        <h1>Una buena decisión empieza con buenas preguntas.</h1>
        <p>
          HÁBITA comparte orientación para quienes buscan un espacio en Trujillo.
          Cada búsqueda es distinta: considera la ubicación, tus necesidades y
          la información disponible antes de tomar una decisión.
        </p>
      </div>
      <section className="services section-wrap">
        <p className="eyebrow">ANTES DE ELEGIR</p>
        <h2>Ten en cuenta lo que importa.</h2>
        <div className="services-grid">
          {[
            {
              title: "Ubicación",
              copy: "Evalúa cómo se conecta el espacio con tus actividades cotidianas.",
            },
            {
              title: "Necesidades",
              copy: "Define qué características son esenciales para ti y quienes vivirán allí.",
            },
            {
              title: "Revisión profesional",
              copy: "Verifica la documentación y las condiciones con especialistas antes de avanzar.",
            },
          ].map((item, index) => (
            <article key={item.title} data-reveal>
              <span className="service-number">0{index + 1}</span>
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
            </article>
          ))}
        </div>
      </section>
      <div className="empty-state">
        <h2>Conoce la propuesta de HÁBITA.</h2>
        <p>
          Este sitio presenta información institucional; no publica un catálogo
          de propiedades ni gestiona solicitudes en línea.
        </p>
        <Link className="button sand" href="/nosotros">
          Así trabajamos
        </Link>
      </div>
    </main>
  );
}
