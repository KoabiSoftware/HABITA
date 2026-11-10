"use client";
export default function Error({ reset }: { reset: () => void }) {
  return (
    <main id="contenido" className="interior-page section-wrap empty-state">
      <p className="eyebrow">UN MOMENTO</p>
      <h1>
        No pudimos cargar
        <br />
        este espacio.
      </h1>
      <p>
        Comprueba que el servidor y la base de datos estén disponibles y vuelve
        a intentarlo.
      </p>
      <button className="button sand" onClick={reset}>
        Volver a intentar
      </button>
    </main>
  );
}
