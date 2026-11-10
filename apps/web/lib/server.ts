import "server-only";
export async function serverApi<T>(path: string): Promise<T> {
  const res = await fetch(
    `${process.env.API_URL || "http://127.0.0.1:4000"}/api/${path}`,
    { cache: "no-store", signal: AbortSignal.timeout(8000) },
  );
  if (!res.ok)
    throw Error(
      "No pudimos conectar con el catálogo. Inténtalo de nuevo en un momento.",
    );
  return res.json();
}
