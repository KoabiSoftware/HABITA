"use client";
import { useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import type { Option } from "../lib/types";
export function SearchForm({
  locations,
  categories,
  initial = {},
  compact = false,
}: {
  locations: Option[];
  categories: Option[];
  initial?: Record<string, string>;
  compact?: boolean;
}) {
  const [operation, setOperation] = useState(initial.operation || "SALE");
  const [budget, setBudget] = useState(initial.maxPrice || "");
  function changeOperation(value: string) {
    setOperation(value);
    setBudget("");
  }
  return (
    <form
      action="/propiedades"
      method="get"
      aria-label="Buscar propiedades"
      className={"property-search " + (compact ? "compact" : "")}
    >
      <div className="search-tabs" aria-label="Operación">
        <button
          type="button"
          className={operation === "SALE" ? "selected" : ""}
          onClick={() => changeOperation("SALE")}
          aria-pressed={operation === "SALE"}
        >
          Comprar
        </button>
        <button
          type="button"
          className={operation === "RENT" ? "selected" : ""}
          onClick={() => changeOperation("RENT")}
          aria-pressed={operation === "RENT"}
        >
          Alquilar
        </button>
      </div>
      <input type="hidden" name="operation" value={operation} />
      <div className="search-fields">
        <label>
          <span>Ubicación</span>
          <select name="location" defaultValue={initial.location || ""}>
            <option value="">Todas las ubicaciones</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
          <ChevronDown size={17} />
        </label>
        <label>
          <span>Tipo de inmueble</span>
          <select name="category" defaultValue={initial.category || ""}>
            <option value="">Todos los tipos</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <ChevronDown size={17} />
        </label>
        <label>
          <span>Presupuesto</span>
          <select
            name="maxPrice"
            value={budget}
            onChange={(event) => setBudget(event.target.value)}
          >
            <option value="">Cualquier presupuesto</option>
            {(operation === "SALE"
              ? [400000, 600000, 800000, 1200000]
              : [2500, 4000, 6000, 10000]
            ).map((v) => (
              <option key={v} value={v}>
                Hasta S/ {v.toLocaleString("en-US")}
              </option>
            ))}
          </select>
          <ChevronDown size={17} />
        </label>
        <button className="button dark search-button" type="submit">
          <Search size={20} />
          Buscar
        </button>
      </div>
    </form>
  );
}
