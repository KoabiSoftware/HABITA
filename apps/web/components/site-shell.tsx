"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  ChevronDown,
  MapPin,
  Menu,
  X,
} from "lucide-react";
import { InvitationHeading } from "./invitation-heading";

export function SiteShell({ children }: { children: ReactNode }) {
  const [mobile, setMobile] = useState(false);
  const path = usePathname();
  const footerMore = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    setMobile(false);
    if (footerMore.current) footerMore.current.open = false;
  }, [path]);

  return (
    <>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <header className="navigation">
        <Link href="/" className="wordmark" aria-label="HÁBITA, inicio">
          HÁBITA
        </Link>
        <span className="nav-divider" />
        <nav
          id="primary-navigation"
          className={mobile ? "nav-links open" : "nav-links"}
          aria-label="Navegación principal"
        >
          {[
            ["/", "Inicio", path === "/"],
            ["/propiedades", "Información inmobiliaria", path.startsWith("/propiedades")],
            ["/nosotros", "Nosotros", path === "/nosotros"],
            ["/contacto", "Contacto", path === "/contacto"],
          ].map(([href, label, active]) => (
            <Link
              key={href as string}
              className={active ? "active" : ""}
              aria-current={active ? "page" : undefined}
              href={href as string}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="nav-actions">
          <Link href="/contacto" className="nav-cta magnetic">
            Hablemos <ArrowUpRight size={14} />
          </Link>
          <button
            className="icon-button menu-button"
            onClick={() => setMobile(!mobile)}
            aria-expanded={mobile}
            aria-controls="primary-navigation"
            aria-label={mobile ? "Cerrar navegación" : "Abrir navegación"}
          >
            {mobile ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      {children}
      <footer className="site-footer">
        <section
          className="footer-invitation"
          aria-labelledby="footer-invitation-title"
        >
          <div className="footer-invitation-inner section-wrap">
            <InvitationHeading />
            <p>
              Conoce nuestra propuesta y la información para una búsqueda
              inmobiliaria más clara.
            </p>
            <Link href="/nosotros" className="button footer-cta magnetic">
              Conócenos
            </Link>
          </div>
        </section>
        <div className="footer-main section-wrap">
          <Link className="footer-logo" href="/">
            HÁBITA<span>Información inmobiliaria en Perú</span>
          </Link>
          <nav aria-label="Navegación del pie">
            <Link href="/">Inicio</Link>
            <Link href="/propiedades">Información inmobiliaria</Link>
            <Link href="/nosotros">Nosotros</Link>
            <Link href="/contacto">Contacto</Link>
          </nav>
          <div className="footer-contact">
            <Link href="/contacto">
              <ArrowUpRight size={14} /> Información de contacto
            </Link>
            <span>
              <MapPin size={14} /> Trujillo, Perú
            </span>
          </div>
          <details className="footer-more" ref={footerMore}>
            <summary>
              Más <ChevronDown size={12} />
            </summary>
            <div className="footer-more-panel">
              <Link href="/privacidad">Privacidad</Link>
              <a href="/journal/index.html">Journal · Guía para compradores</a>
              <small>© {new Date().getFullYear()} HÁBITA.</small>
            </div>
          </details>
        </div>
      </footer>
    </>
  );
}
