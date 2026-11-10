import Link from "next/link";
export const metadata = { title: "Privacidad y uso de datos" };
export default function Privacy() {
  return (
    <main id="contenido" className="interior-page section-wrap legal-page">
      <p className="eyebrow">INFORMACIÓN CLARA</p>
      <h1>Privacidad.</h1>
      <p>
        Esta plataforma es una demostración local de HÁBITA. El catálogo, los
        precios y las fotografías son ilustrativos. No se realizan operaciones
        inmobiliarias a través del sitio.
      </p>
      <h2>Datos que registramos</h2>
      <p>
        Si creas una cuenta, guardamos tu nombre, correo y contraseña cifrada
        mediante hash. Si envías una consulta, guardamos tu nombre, correo,
        teléfono, mensaje y la propiedad asociada, cuando corresponda. Los
        favoritos se vinculan a tu cuenta.
      </p>
      <h2>Finalidad y acceso</h2>
      <p>
        Los datos permiten gestionar tu sesión, tu selección y las solicitudes
        de información. Las consultas solo son accesibles para la administración
        autorizada. Esta versión no envía correos, mensajes de WhatsApp ni datos
        a un CRM.
      </p>
      <h2>Cookies</h2>
      <p>
        Utilizamos una cookie de sesión HttpOnly, con política SameSite, para
        mantener tu cuenta conectada. Puedes eliminarla al cerrar sesión o desde
        tu navegador. No incorporamos cookies de publicidad ni herramientas de
        analítica.
      </p>
      <h2>Conservación y derechos</h2>
      <p>
        En el entorno local los registros permanecen en la base de datos hasta
        su eliminación por el responsable de la instalación. Antes de una
        publicación comercial deben completarse la identidad y los datos de
        contacto del responsable, los plazos de conservación y el procedimiento
        para ejercer tus derechos conforme a la normativa aplicable.
      </p>
      <Link className="button sand" href="/contacto">
        Volver al contacto
      </Link>
    </main>
  );
}
