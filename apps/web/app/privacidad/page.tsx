import Link from "next/link";
export const metadata = { title: "Privacidad y uso de datos" };
export default function Privacy() {
  return (
    <main id="contenido" className="interior-page section-wrap legal-page">
      <p className="eyebrow">INFORMACIÓN CLARA</p>
      <h1>Privacidad.</h1>
      <p>
        Este sitio tiene carácter informativo. No permite crear cuentas, guardar
        favoritos ni enviar consultas mediante formularios.
      </p>
      <h2>Información personal</h2>
      <p>
        El sitio no solicita ni almacena datos personales en una base de datos.
        Si utilizas un enlace externo, como WhatsApp cuando esté habilitado, el
        servicio de destino aplica sus propias políticas de privacidad.
      </p>
      <h2>Navegación</h2>
      <p>
        No usamos cuentas de usuario ni cookies de sesión para ofrecer las páginas
        informativas de HÁBITA.
      </p>
      <Link className="button sand" href="/contacto">
        Volver a la información de contacto
      </Link>
    </main>
  );
}
