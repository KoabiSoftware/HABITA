"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, MessageCircle } from "lucide-react";
import { api } from "./platform";
export function ContactForm({
  propertyId,
  propertyTitle,
}: {
  propertyId?: string;
  propertyTitle?: string;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [code, setCode] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    try {
      const r = await api<{ id: string }>("inquiries", "POST", {
        name: f.get("name"),
        email: f.get("email"),
        phone: f.get("phone"),
        message: f.get("message"),
        consent: f.get("consent") === "on",
        ...(propertyId ? { propertyId } : {}),
      });
      setCode(r.id);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  if (code)
    return (
      <div className="contact-success" role="status">
        <CheckCircle2 size={42} />
        <h2>
          El primer paso
          <br />
          ya está dado.
        </h2>
        <p>Tu solicitud se ha registrado correctamente.</p>
        <small>Código de solicitud</small>
        <code>{code}</code>
        <p className="muted">
          En esta versión de demostración no se envían correos ni mensajes
          externos.
        </p>
        <button className="text-link" onClick={() => setCode("")}>
          Enviar otra consulta <ArrowUpRight size={16} />
        </button>
      </div>
    );
  return (
    <form className="contact-form" onSubmit={submit}>
      <div className="form-row">
        <label>
          Tu nombre
          <input
            name="name"
            placeholder="¿Cómo te llamas?"
            required
            minLength={2}
            maxLength={80}
            autoComplete="name"
          />
        </label>
        <label>
          Teléfono
          <input
            name="phone"
            placeholder="+51 999 000 000"
            required
            minLength={7}
            maxLength={25}
            autoComplete="tel"
            type="tel"
          />
        </label>
      </div>
      <label>
        Correo electrónico
        <input
          name="email"
          placeholder="tu@correo.com"
          type="email"
          required
          autoComplete="email"
        />
      </label>
      <label>
        Cuéntanos qué estás buscando
        <textarea
          name="message"
          rows={4}
          required
          minLength={15}
          maxLength={2000}
          placeholder="Un espacio para empezar una nueva etapa…"
          defaultValue={
            propertyTitle
              ? `Hola, me interesa ${propertyTitle}. Me gustaría recibir información y coordinar una visita.`
              : ""
          }
        />
      </label>
      <label className="consent">
        <input name="consent" type="checkbox" required />
        <span>
          He leído la <Link href="/privacidad">política de privacidad</Link> y
          autorizo el registro de mi consulta.
        </span>
      </label>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button className="button sand" disabled={busy}>
        {busy ? "Enviando…" : "Enviar mi consulta"}
        <ArrowUpRight size={19} />
      </button>
      <small className="muted">
        Tu consulta se guarda de forma privada en la plataforma.
      </small>
    </form>
  );
}
export function WhatsAppLink({ title }: { title?: string }) {
  const n = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  if (!n || !/^\d{8,15}$/.test(n))
    return (
      <p className="channel-note">
        <MessageCircle size={18} />
        WhatsApp estará disponible al configurar el número de atención.
      </p>
    );
  return (
    <a
      className="button outline"
      href={`https://wa.me/${n}?text=${encodeURIComponent(title ? `Hola, me interesa ${title}.` : "Hola, quiero encontrar mi próximo hogar con HÁBITA.")}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <MessageCircle size={18} />
      Conversar por WhatsApp
    </a>
  );
}
