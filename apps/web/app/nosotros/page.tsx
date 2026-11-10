import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Search, CalendarDays, House } from "lucide-react";
export const metadata: Metadata = {
  title: "Nuestra forma de entender el hogar",
};
export default function About() {
  return (
    <main id="contenido" className="interior-page about-page">
      <div className="section-wrap about-intro" data-reveal>
        <p className="eyebrow">NUESTRA FORMA DE VER EL MUNDO</p>
        <h1>
          Un hogar es mucho más
          <br />
          que una dirección.
        </h1>
        <p>
          Es donde empieza tu día. Donde vuelves a ser tú.
          <br />
          Donde la vida encuentra su lugar.
        </p>
      </div>
      <div className="about-full-image">
        <img
          src="/images/nosotros.webp"
          alt="Una sala de arquitectura contemporánea integrada a la naturaleza"
          data-parallax
        />
      </div>
      <section className="section-wrap about-philosophy" data-reveal>
        <p className="eyebrow">LA MIRADA HÁBITA</p>
        <div>
          <h2>
            Espacios con intención.
            <br />
            Decisiones con confianza.
          </h2>
          <p>
            HÁBITA nace como una propuesta de experiencia inmobiliaria en
            Trujillo: una selección clara de espacios, información que se
            entiende y acompañamiento en cada paso.
          </p>
          <p>
            Creemos en una búsqueda que empieza escuchando. En visitar sin
            prisa. En revisar los detalles antes de tomar una decisión.
          </p>
          <Link className="text-link" href="/contacto">
            Hablemos de lo que buscas <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
      <section className="services section-wrap">
        <p className="eyebrow">TE ACOMPAÑAMOS</p>
        <h2>
          De la primera idea
          <br />
          al siguiente capítulo.
        </h2>
        <div className="services-grid">
          {[
            {
              icon: Search,
              title: "Búsqueda a tu medida",
              copy: "Ubicación, distribución y presupuesto. Ordenamos contigo lo que de verdad importa para encontrar tu lugar.",
            },
            {
              icon: CalendarDays,
              title: "Visitas con propósito",
              copy: "Conoce cada espacio, pregunta por sus detalles y evalúa cómo encaja en tu día a día.",
            },
            {
              icon: House,
              title: "Una decisión informada",
              copy: "Reúne la información de la propiedad y coordina la revisión profesional que tu operación requiera.",
            },
          ].map((s, i) => (
            <article key={s.title} data-reveal>
              <span className="service-number">0{i + 1}</span>
              <s.icon strokeWidth={1} />
              <h3>{s.title}</h3>
              <p>{s.copy}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="testimonial-placeholder section-wrap">
        <p className="eyebrow">HISTORIAS POR CONSTRUIR</p>
        <h2>
          La confianza se gana
          <br />
          en cada paso.
        </h2>
        <p>
          Aquí compartiremos testimonios cuando contemos con experiencias reales
          y autorización de sus protagonistas.
        </p>
      </section>
    </main>
  );
}
