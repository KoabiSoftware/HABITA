"use client";
import { useRef, useState, useEffect } from "react";
import { Expand, X, ChevronLeft, ChevronRight } from "lucide-react";
import type { Property } from "../lib/types";
export function Gallery({ media }: { media: Property["media"] }) {
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDialogElement>(null);
  const images = media.filter((m) => m.kind === "IMAGE");
  if (!images.length)
    return (
      <div className="image-pending detail-placeholder">
        Fotografías en preparación
      </div>
    );
  function move(n: number) {
    setActive((a) => (a + n + images.length) % images.length);
  }
  return (
    <>
      <div className="detail-gallery">
        <button
          className="gallery-main"
          onClick={() => ref.current?.showModal()}
          aria-label="Ampliar fotografía"
        >
          <img
            src={images[active].url}
            alt={images[active].alt}
            fetchPriority="high"
          />
          <span>
            <Expand size={18} />
            Ampliar fotografía
          </span>
        </button>
        {images.length > 1 && (
          <div className="gallery-thumbnails">
            {images.map((m, i) => (
              <button
                key={m.id}
                onClick={() => setActive(i)}
                aria-label={"Ver imagen " + (i + 1)}
                aria-pressed={active === i}
              >
                <img src={m.url} alt={m.alt} />
              </button>
            ))}
          </div>
        )}
      </div>
      <dialog
        ref={ref}
        className="gallery-dialog"
        onClick={(e) => {
          if (e.target === ref.current) ref.current?.close();
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") move(-1);
          if (e.key === "ArrowRight") move(1);
        }}
      >
        <button
          className="icon-button gallery-close"
          onClick={() => ref.current?.close()}
          aria-label="Cerrar fotografía"
        >
          <X />
        </button>
        <img src={images[active].url} alt={images[active].alt} />
        {images.length > 1 && (
          <div className="gallery-controls">
            <button onClick={() => move(-1)} aria-label="Anterior">
              <ChevronLeft />
            </button>
            <span>
              {active + 1} / {images.length}
            </span>
            <button onClick={() => move(1)} aria-label="Siguiente">
              <ChevronRight />
            </button>
          </div>
        )}
      </dialog>
    </>
  );
}
