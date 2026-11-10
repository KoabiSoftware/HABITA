"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  type ReactNode,
  type FormEvent,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  Heart,
  Menu,
  X,
  ArrowRight,
  LogOut,
  UserRound,
  Check,
  Search,
  MapPin,
  Mail,
  ChevronDown,
} from "lucide-react";
import type { User } from "../lib/types";
import { InvitationHeading } from "./invitation-heading";
export async function api<T = any>(
  path: string,
  method = "GET",
  data?: unknown,
): Promise<T> {
  const r = await fetch("/api/" + path, {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    ...(data !== undefined ? { body: JSON.stringify(data) } : {}),
  });
  const body = await r.json().catch(() => ({}));
  if (!r.ok)
    throw Object.assign(
      Error(
        Array.isArray(body.message)
          ? body.message.join(" · ")
          : body.message || "No pudimos completar la solicitud.",
      ),
      { status: r.status },
    );
  return body;
}
const Context = createContext<{
  user: User | null;
  favorites: string[];
  authenticate: () => void;
  toggle: (id: string) => void;
  notify: (s: string) => void;
}>({
  user: null,
  favorites: [],
  authenticate: () => {},
  toggle: () => {},
  notify: () => {},
});
export const usePlatform = () => useContext(Context);
export function Platform({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null),
    [favorites, setFavorites] = useState<string[]>([]),
    [auth, setAuth] = useState(false),
    [register, setRegister] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [mobile, setMobile] = useState(false);
  const path = usePathname();
  const dialog = useRef<HTMLDialogElement>(null),
    pending = useRef(new Set<string>());
  const footerMore = useRef<HTMLDetailsElement>(null);
  const notify = (s: string) => setMessage(s);
  async function loadFavorites() {
    try {
      setFavorites((await api<any[]>("favorites")).map((f) => f.propertyId));
    } catch {
      setFavorites([]);
    }
  }
  useEffect(() => {
    api<User>("auth/me")
      .then((u) => {
        setUser(u);
        loadFavorites();
      })
      .catch(() => {});
  }, []);
  useEffect(() => {
    setMobile(false);
    if (footerMore.current) footerMore.current.open = false;
  }, [path]);
  useEffect(() => {
    if (auth) {
      dialog.current?.showModal();
    } else dialog.current?.close();
  }, [auth]);
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(""), 5500);
    return () => clearTimeout(t);
  }, [message]);
  async function toggle(id: string) {
    if (!user) {
      setAuth(true);
      notify("Inicia sesión para guardar tus propiedades.");
      return;
    }
    if (pending.current.has(id)) return;
    pending.current.add(id);
    try {
      const exists = favorites.includes(id);
      await api("favorites/" + id, exists ? "DELETE" : "POST");
      setFavorites((f) => (exists ? f.filter((x) => x !== id) : [...f, id]));
      notify(
        exists
          ? "Propiedad eliminada de tus favoritos."
          : "Propiedad guardada en tus favoritos.",
      );
    } catch (e: any) {
      notify(e.message);
    } finally {
      pending.current.delete(id);
    }
  }
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const u = await api<User>(
        "auth/" + (register ? "register" : "login"),
        "POST",
        data,
      );
      setUser(u);
      await loadFavorites();
      setAuth(false);
      notify("Bienvenido, " + u.name.split(" ")[0] + ".");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    try {
      await api("auth/logout", "POST", {});
      setUser(null);
      setFavorites([]);
      notify("Sesión cerrada.");
    } catch (e: any) {
      notify(e.message);
    }
  }
  return (
    <Context.Provider
      value={{
        user,
        favorites,
        authenticate: () => {
          setError("");
          setAuth(true);
        },
        toggle,
        notify,
      }}
    >
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
          <Link
            className={path === "/" ? "active" : ""}
            aria-current={path === "/" ? "page" : undefined}
            href="/"
          >
            Inicio
          </Link>
          <Link
            className={path.startsWith("/propiedades") ? "active" : ""}
            aria-current={path.startsWith("/propiedades") ? "page" : undefined}
            href="/propiedades"
          >
            Propiedades
          </Link>
          <Link
            className={path === "/nosotros" ? "active" : ""}
            aria-current={path === "/nosotros" ? "page" : undefined}
            href="/nosotros"
          >
            Nosotros
          </Link>
          <Link
            className={path === "/contacto" ? "active" : ""}
            aria-current={path === "/contacto" ? "page" : undefined}
            href="/contacto"
          >
            Contacto
          </Link>
        </nav>
        <div className="nav-actions">
          <Link
            className="icon-button favorite-nav"
            href="/favoritos"
            aria-label={`Favoritos, ${favorites.length} guardados`}
          >
            <Heart size={17} />
            {favorites.length > 0 && <span>{favorites.length}</span>}
          </Link>
          <button
            className="icon-button account-button"
            onClick={() => (user ? logout() : setAuth(true))}
            aria-label={user ? "Cerrar sesión" : "Iniciar sesión"}
            title={user ? user.name : "Iniciar sesión"}
          >
            {user ? <LogOut size={17} /> : <UserRound size={17} />}
          </button>
          <Link href="/contacto" className="nav-cta magnetic">
            Hablemos <ArrowUpRight size={14} />
          </Link>
          <button
            className="icon-button menu-button"
            onClick={() => setMobile(!mobile)}
            aria-expanded={mobile}
            aria-controls="primary-navigation"
            aria-label="Abrir navegación"
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
              Cuéntanos qué estás buscando y te ayudaremos a encontrar las mejores
              opciones para ti.
            </p>
            <Link href="/contacto" className="button footer-cta magnetic">
              Hablemos
            </Link>
          </div>
        </section>
        <div className="footer-main section-wrap">
          <Link className="footer-logo" href="/">
            HÁBITA<span>Inmobiliaria en Perú</span>
          </Link>
          <nav aria-label="Navegación del pie">
            <Link href="/">Inicio</Link>
            <Link href="/propiedades">Propiedades</Link>
            <Link href="/nosotros">Nosotros</Link>
            <Link href="/contacto">Contacto</Link>
          </nav>
          <div className="footer-contact">
            <Link href="/contacto">
              <Mail size={14} /> Escríbenos
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
              <Link href="/favoritos">Favoritos</Link>
              <button
                className="footer-account"
                onClick={() => (user ? logout() : setAuth(true))}
              >
                {user ? "Cerrar sesión" : "Iniciar sesión"}
              </button>
              <Link href="/privacidad">Privacidad</Link>
              <a href="/journal/index.html">Journal · Guía para compradores</a>
              <small>
                © {new Date().getFullYear()} HÁBITA.
                <br />
                Catálogo e imágenes de demostración.
              </small>
            </div>
          </details>
        </div>
      </footer>
      <dialog
        ref={dialog}
        className="auth-dialog"
        onCancel={() => setAuth(false)}
        onClick={(e) => {
          if (e.target === dialog.current) setAuth(false);
        }}
      >
        <div className="dialog-body">
          <button
            className="close-dialog icon-button"
            onClick={() => setAuth(false)}
            aria-label="Cerrar"
          >
            <X />
          </button>
          <p className="eyebrow">TU SELECCIÓN, SIEMPRE CERCA</p>
          <h2>{register ? "Tu próximo capítulo." : "Qué bueno verte."}</h2>
          <p className="muted">
            {register
              ? "Crea una cuenta para guardar los espacios que te inspiran."
              : "Accede para retomar la búsqueda de tu hogar."}
          </p>
          <form onSubmit={submit} key={register ? "register" : "login"}>
            {register && (
              <label>
                Tu nombre
                <input
                  name="name"
                  required
                  minLength={2}
                  maxLength={80}
                  autoComplete="name"
                />
              </label>
            )}
            <label>
              Correo electrónico
              <input type="email" name="email" required autoComplete="email" />
            </label>
            <label>
              Contraseña
              <input
                type="password"
                name="password"
                required
                minLength={10}
                maxLength={72}
                autoComplete={register ? "new-password" : "current-password"}
              />
            </label>
            {register && (
              <small>
                Mínimo 10 caracteres. Al crear tu cuenta aceptas el tratamiento
                descrito en{" "}
                <Link href="/privacidad" onClick={() => setAuth(false)}>
                  Privacidad
                </Link>
                .
              </small>
            )}
            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}
            <button className="button sand" disabled={busy}>
              {busy ? "Un momento…" : register ? "Crear mi cuenta" : "Entrar"}
              <ArrowRight size={18} />
            </button>
          </form>
          <button
            className="text-link switch-auth"
            onClick={() => {
              setRegister(!register);
              setError("");
            }}
          >
            {register ? "Ya tengo una cuenta" : "Quiero crear una cuenta"}
          </button>
        </div>
      </dialog>
      <div className={"toast " + (message ? "visible" : "")} role="status">
        <Check size={18} />
        {message}
      </div>
    </Context.Provider>
  );
}
export function FavoriteButton({ id }: { id: string }) {
  const { favorites, toggle } = usePlatform();
  const selected = favorites.includes(id);
  return (
    <button
      className={"save-button " + (selected ? "saved" : "")}
      onClick={() => toggle(id)}
      aria-label={selected ? "Quitar de favoritos" : "Guardar propiedad"}
      aria-pressed={selected}
    >
      <Heart size={19} fill={selected ? "currentColor" : "none"} />
    </button>
  );
}
export function AccountPrompt() {
  const { user, authenticate } = usePlatform();
  return !user ? (
    <div className="empty-state">
      <Heart size={32} />
      <h2>Un lugar para tus favoritos.</h2>
      <p>Inicia sesión para guardar y comparar los espacios que te gustan.</p>
      <button className="button sand" onClick={authenticate}>
        Iniciar sesión <ArrowRight size={17} />
      </button>
    </div>
  ) : null;
}
