import Link from "next/link";
import { ArrowUpRight, Search, CalendarDays, House } from "lucide-react";
export default function Home() {
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
            Conoce nuestra propuesta
          </Link>
        </div>
      </section>
      <section className="featured section-wrap" id="destacadas">
        <div className="section-heading" data-reveal>
          <div>
            <p className="eyebrow">SERVICIOS HÁBITA</p>
            <h2>Información clara para elegir con confianza.</h2>
          </div>
        </div>
        <div className="services-grid">
          {[
            {
              icon: Search,
              title: "Orientación inmobiliaria",
              copy: "Conoce los aspectos importantes para iniciar la búsqueda de un espacio.",
            },
            {
              icon: CalendarDays,
              title: "Visitas con propósito",
              copy: "Prepara tus preguntas y evalúa cada lugar de acuerdo con tus necesidades.",
            },
            {
              icon: House,
              title: "Decisiones informadas",
              copy: "Revisa los detalles y busca asesoramiento profesional antes de decidir.",
            },
          ].map((service, index) => (
            <article key={service.title} data-reveal>
              <span className="service-number">0{index + 1}</span>
              <service.icon strokeWidth={1} />
              <h3>{service.title}</h3>
              <p>{service.copy}</p>
            </article>
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
                  { icon: Search, title: "Conoce nuestra propuesta", href: "/propiedades" },
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
