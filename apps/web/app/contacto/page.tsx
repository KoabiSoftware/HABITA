import type { Metadata } from "next";
import { ArrowUpRight, MapPin, Clock3 } from "lucide-react";
import { WhatsAppLink } from "../../components/contact-options";
export const metadata: Metadata = { title: "Hablemos de tu próximo hogar" };
export default function Contact() {
  return (
    <main id="contenido" className="interior-page contact-page section-wrap">
      <div className="contact-columns">
        <div className="contact-editorial" data-reveal>
          <p className="eyebrow">EL PRIMER PASO ES CONVERSAR</p>
          <h1>
            Tu próximo hogar
            <br />
            empieza aquí<span className="sand-dot">.</span>
          </h1>
          <p className="lead">
            Cuéntanos cómo quieres vivir.
            <br />
            Encontrar el lugar viene después.
          </p>
          <div className="contact-image">
            <img
              src="/images/nosotros.webp"
              alt="Un salón sereno con conexión al jardín"
              loading="lazy"
            />
          </div>
          <div className="contact-facts">
            <span>
              <MapPin size={17} />
              Trujillo, Perú
            </span>
            <span>
              <Clock3 size={17} />
              Visitas con cita previa
            </span>
          </div>
        </div>
        <div className="contact-form-panel" data-reveal>
          <p className="eyebrow">CONVERSEMOS</p>
          <h2>Nos gustaría conocerte.</h2>
          <p className="muted">
            Este sitio comparte información institucional de HÁBITA. No registra
            consultas ni almacena datos personales.
          </p>
          <div className="contact-alternative">
            <WhatsAppLink />
          </div>
        </div>
      </div>
    </main>
  );
}
