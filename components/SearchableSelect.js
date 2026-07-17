import { useEffect, useRef, useState } from "react";
import { Search, ChevronDown } from "lucide-react";

// Türkçe karakterleri (İ/I, ı/i, ş, ğ, ü, ö, ç) doğru küçük harfe çeviren
// karşılaştırma için toLocaleLowerCase("tr") kullanılır.
function norm(s) {
  return (s || "").toLocaleLowerCase("tr").trim();
}

/**
 * Yazarak aranabilir dropdown (combobox).
 * - Liste her zaman alfabetik gelir (options zaten sıralı varsayılır).
 * - Yazılan harflerle başlayan sonuçlar en üste çıkar ve ilk eşleşme
 *   otomatik vurgulanır (ör. "SE" -> S,E ile başlayanlar üstte;
 *   "SEL" yazınca liste daha da daralır).
 * - Enter: vurgulanan seçeneği seçer. Yukarı/Aşağı: vurguyu taşır.
 * - allowOther=true ise listenin altına "Diğer (yaz)" seçeneği eklenir.
 */
export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Seçiniz…",
  allowOther = false,
  otherValue = "__diger__",
  otherLabel = "Diğer (yaz)",
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const wrapRef = useRef(null);
  const listRef = useRef(null);

  const q = norm(query);
  const filtered = !q
    ? options
    : options
        .filter((o) => norm(o).includes(q))
        .sort((a, b) => {
          const aStarts = norm(a).startsWith(q) ? 0 : 1;
          const bStarts = norm(b).startsWith(q) ? 0 : 1;
          if (aStarts !== bStarts) return aStarts - bStarts;
          return a.localeCompare(b, "tr");
        });

  useEffect(() => {
    setHighlight(0);
  }, [query, open]);

  useEffect(() => {
    function onOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  useEffect(() => {
    if (open && listRef.current) {
      const el = listRef.current.querySelector(`[data-idx="${highlight}"]`);
      if (el) el.scrollIntoView({ block: "nearest" });
    }
  }, [highlight, open]);

  function selectValue(v) {
    onChange(v);
    setOpen(false);
    setQuery("");
  }

  function handleKeyDown(e) {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[highlight]) selectValue(filtered[highlight]);
      else if (allowOther) selectValue(otherValue);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      setQuery("");
    }
  }

  const displayValue = open ? query : value === otherValue ? otherLabel : value || "";

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <div style={{ position: "relative" }}>
        <Search size={15} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#7C8C90", pointerEvents: "none" }} />
        <input
          style={{
            width: "100%",
            padding: "11px 32px 11px 32px",
            fontSize: 14,
            border: "1px solid #E1E8E7",
            borderRadius: 10,
            background: "#FBFCFC",
            color: "#0F3A44",
            outline: "none",
          }}
          placeholder={placeholder}
          value={displayValue}
          onFocus={() => {
            setOpen(true);
            setQuery("");
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onKeyDown={handleKeyDown}
        />
        <ChevronDown size={15} style={{ position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)", color: "#7C8C90", pointerEvents: "none" }} />
      </div>
      {open && (
        <div
          ref={listRef}
          style={{
            position: "absolute",
            zIndex: 30,
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            maxHeight: 230,
            overflowY: "auto",
            background: "#fff",
            border: "1px solid #E1E8E7",
            borderRadius: 10,
            boxShadow: "0 8px 24px rgba(15,58,68,0.14)",
          }}
        >
          {filtered.length === 0 && (
            <div style={{ padding: "10px 12px", fontSize: 13, color: "#7C8C90" }}>Sonuç bulunamadı</div>
          )}
          {filtered.map((o, i) => (
            <div
              key={o}
              data-idx={i}
              onMouseDown={(e) => {
                e.preventDefault();
                selectValue(o);
              }}
              onMouseEnter={() => setHighlight(i)}
              style={{
                padding: "9px 12px",
                fontSize: 13.5,
                cursor: "pointer",
                background: i === highlight ? "#EEF6F3" : "transparent",
                color: "#0F3A44",
                fontWeight: i === highlight ? 700 : 500,
              }}
            >
              {o}
            </div>
          ))}
          {allowOther && (
            <div
              onMouseDown={(e) => {
                e.preventDefault();
                selectValue(otherValue);
              }}
              style={{
                padding: "9px 12px",
                fontSize: 13.5,
                cursor: "pointer",
                color: "#17A673",
                fontWeight: 700,
                borderTop: "1px solid #EEF2F1",
              }}
            >
              {otherLabel}
            </div>
          )}
        </div>
      )}
    </div>
  );
}