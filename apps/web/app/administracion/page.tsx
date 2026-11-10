"use client";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowUpRight, Plus, ImagePlus } from "lucide-react";
import { api, usePlatform, AccountPrompt } from "../../components/platform";
import type { Property, Option } from "../../lib/types";
const blank = {
  title: "",
  slug: "",
  description: "",
  price: 0,
  area: 0,
  bedrooms: 0,
  bathrooms: 0,
  parking: 0,
  operation: "SALE",
  status: "AVAILABLE",
  featured: false,
  amenities: [] as string[],
  address: "",
  categoryId: "",
  locationId: "",
};
export default function Administration() {
  const { user, notify } = usePlatform();
  const [items, setItems] = useState<Property[]>([]),
    [locations, setLocations] = useState<Option[]>([]),
    [categories, setCategories] = useState<Option[]>([]),
    [inquiries, setInquiries] = useState<any[]>([]),
    [editing, setEditing] = useState<Property | null>(null),
    [showForm, setShowForm] = useState(false),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [media, setMedia] = useState<Property["media"]>([]);
  async function load() {
    try {
      const [p, l, c, i] = await Promise.all([
        api<Property[]>("admin/properties"),
        api<Option[]>("locations"),
        api<Option[]>("categories"),
        api<any[]>("inquiries"),
      ]);
      setItems(p);
      setLocations(l);
      setCategories(c);
      setInquiries(i);
      setError("");
    } catch (e: any) {
      setError(e.message);
    }
  }
  useEffect(() => {
    if (user?.role === "ADMIN") load();
  }, [user]);
  function edit(p: Property | null) {
    setEditing(p);
    setShowForm(true);
    setMedia(p?.media || []);
    setError("");
  }
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const data: any = Object.fromEntries(f);
    for (const k of ["price", "area", "bedrooms", "bathrooms", "parking"])
      data[k] = Number(f.get(k));
    data.featured = f.get("featured") === "on";
    data.amenities = String(f.get("amenities"))
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    setBusy(true);
    try {
      const p = await api<Property>(
        "admin/properties" + (editing ? "/" + editing.id : ""),
        editing ? "PATCH" : "POST",
        data,
      );
      setEditing(p);
      setMedia(p.media);
      await load();
      notify("Propiedad guardada.");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function archive(p: Property) {
    setBusy(true);
    try {
      await api("admin/properties/" + p.id, "DELETE");
      await load();
      if (editing?.id === p.id) {
        setEditing(null);
        setShowForm(false);
      }
      notify("Propiedad archivada. Puedes restaurarla editando su estado.");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function addMedia(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    const form = e.currentTarget,
      f = new FormData(form);
    setBusy(true);
    try {
      await api("media", "POST", {
        propertyId: editing.id,
        url: f.get("url"),
        alt: f.get("alt"),
        kind: "IMAGE",
        position: media.length,
      });
      setMedia(await api("media/" + editing.id));
      await load();
      form.reset();
      notify("Imagen vinculada.");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function removeMedia(id: string) {
    try {
      await api("media/" + id, "DELETE");
      setMedia((m) => m.filter((x) => x.id !== id));
      await load();
    } catch (e: any) {
      setError(e.message);
    }
  }
  const p = editing || blank;
  return (
    <main id="contenido" className="interior-page section-wrap admin-page">
      <p className="eyebrow">GESTIÓN HÁBITA</p>
      <h1>Administración.</h1>
      <AccountPrompt />
      {user && user.role !== "ADMIN" && (
        <p>Esta sección requiere una cuenta de administración.</p>
      )}
      {user?.role === "ADMIN" && (
        <>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <div className="catalog-toolbar">
            <p>
              {items.length} propiedades · {inquiries.length} consultas
              recientes
            </p>
            <button className="button sand" onClick={() => edit(null)}>
              <Plus size={17} />
              Nueva propiedad
            </button>
          </div>
          <div className="admin-layout">
            <div className="admin-list">
              {items.map((item) => (
                <article key={item.id}>
                  <h3>{item.title}</h3>
                  <p>
                    {item.status} · S/ {Number(item.price).toLocaleString()} ·{" "}
                    {item.location.name}
                  </p>
                  <div>
                    <button className="text-link" onClick={() => edit(item)}>
                      Editar <ArrowUpRight size={15} />
                    </button>
                    {item.status !== "ARCHIVED" && (
                      <button
                        className="text-link"
                        disabled={busy}
                        onClick={() => archive(item)}
                      >
                        Archivar
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
            <div>
              {showForm ? (
                <>
                  <form
                    className="admin-form"
                    onSubmit={save}
                    key={editing?.id || "new"}
                  >
                    <h2>{editing ? "Editar propiedad" : "Nueva propiedad"}</h2>
                    {[
                      ["title", "Título"],
                      ["slug", "Identificador de URL"],
                      ["address", "Zona o dirección"],
                    ].map(([name, label]) => (
                      <label key={name}>
                        {label}
                        <input
                          name={name}
                          defaultValue={(p as any)[name]}
                          required
                        />
                      </label>
                    ))}
                    <label>
                      Descripción
                      <textarea
                        name="description"
                        defaultValue={p.description}
                        minLength={20}
                        required
                        rows={5}
                      />
                    </label>
                    <div className="form-row">
                      {[
                        ["price", "Precio (S/)"],
                        ["area", "Área (m²)"],
                        ["bedrooms", "Dormitorios"],
                        ["bathrooms", "Baños"],
                        ["parking", "Estacionamientos"],
                      ].map(([name, label]) => (
                        <label key={name}>
                          {label}
                          <input
                            name={name}
                            type="number"
                            min={["price", "area"].includes(name) ? 1 : 0}
                            step="1"
                            defaultValue={(p as any)[name]}
                            required
                          />
                        </label>
                      ))}
                    </div>
                    <label>
                      Ubicación
                      <select
                        name="locationId"
                        required
                        defaultValue={p.locationId}
                      >
                        <option value="">Seleccionar</option>
                        {locations.map((l) => (
                          <option value={l.id} key={l.id}>
                            {l.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Tipo
                      <select
                        name="categoryId"
                        required
                        defaultValue={p.categoryId}
                      >
                        <option value="">Seleccionar</option>
                        {categories.map((c) => (
                          <option value={c.id} key={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="form-row">
                      <label>
                        Operación
                        <select name="operation" defaultValue={p.operation}>
                          <option value="SALE">Venta</option>
                          <option value="RENT">Alquiler</option>
                        </select>
                      </label>
                      <label>
                        Estado
                        <select name="status" defaultValue={p.status}>
                          {["AVAILABLE", "RESERVED", "SOLD", "ARCHIVED"].map(
                            (s) => (
                              <option key={s}>{s}</option>
                            ),
                          )}
                        </select>
                      </label>
                    </div>
                    <label>
                      Características (separadas por comas)
                      <textarea
                        name="amenities"
                        defaultValue={p.amenities.join(", ")}
                        rows={2}
                      />
                    </label>
                    <label className="consent">
                      <input
                        name="featured"
                        type="checkbox"
                        defaultChecked={p.featured}
                      />
                      Destacada
                    </label>
                    <button disabled={busy} className="button sand">
                      {busy ? "Guardando…" : "Guardar propiedad"}
                    </button>
                    <button
                      type="button"
                      className="text-link"
                      onClick={() => setShowForm(false)}
                    >
                      Cerrar edición
                    </button>
                  </form>
                  {editing && (
                    <section className="admin-form admin-media">
                      <h3>Imágenes de la propiedad</h3>
                      {media.map((m) => (
                        <div key={m.id} className="media-row">
                          <span>{m.alt}</span>
                          <button
                            className="text-link"
                            onClick={() => removeMedia(m.id)}
                          >
                            Quitar
                          </button>
                        </div>
                      ))}
                      <form onSubmit={addMedia}>
                        <label>
                          URL HTTPS o ruta /images/
                          <input name="url" required placeholder="https://…" />
                        </label>
                        <label>
                          Descripción accesible
                          <input
                            name="alt"
                            required
                            minLength={5}
                            maxLength={180}
                          />
                        </label>
                        <button className="button sand" disabled={busy}>
                          <ImagePlus size={17} />
                          Vincular imagen
                        </button>
                      </form>
                      <small className="muted">
                        Vincula archivos previamente alojados. Esta versión no
                        sube archivos a servicios externos.
                      </small>
                    </section>
                  )}
                </>
              ) : (
                <div className="empty-state">
                  <p>
                    Selecciona una propiedad para editar sus datos e imágenes.
                  </p>
                </div>
              )}
            </div>
          </div>
          <section className="admin-inquiries">
            <p className="eyebrow">CONSULTAS PRIVADAS</p>
            <h2>Conversaciones por comenzar.</h2>
            {inquiries.length ? (
              inquiries.map((i) => (
                <article key={i.id}>
                  <h3>
                    {i.name} · {i.property?.title || "Consulta general"}
                  </h3>
                  <p>
                    {i.email} · {i.phone}
                  </p>
                  <p>{i.message}</p>
                  <small className="muted">
                    {new Date(i.createdAt).toLocaleString("es-PE")} · {i.id}
                  </small>
                </article>
              ))
            ) : (
              <p className="muted">Aún no hay solicitudes.</p>
            )}
          </section>
        </>
      )}
    </main>
  );
}
