"use client";

import { useEffect, useRef, useState } from "react";

interface MermaidBlockProps {
  code: string;
}

/**
 * Rendu d'un bloc Mermaid (diagramme) cote client.
 * Charge mermaid dynamiquement pour eviter de gonfler le bundle initial.
 */
export function MermaidBlock({ code }: MermaidBlockProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({ startOnLoad: false, theme: "default", securityLevel: "loose" });
        const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
        const { svg } = await mermaid.render(id, code);
        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg;
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Erreur Mermaid");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code]);

  if (error) {
    return (
      <div className="my-4 p-3 rounded-lg border border-red-200 bg-red-50 text-xs text-red-700">
        Diagramme Mermaid invalide : {error}
        <pre className="mt-2 whitespace-pre-wrap font-mono text-[11px] text-red-600">{code}</pre>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="my-4 flex justify-center overflow-x-auto rounded-lg border border-eleo-gray-200 bg-white p-4"
    />
  );
}
