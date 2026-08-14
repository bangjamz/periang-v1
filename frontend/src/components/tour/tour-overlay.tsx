"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import { TOUR_STEPS } from "@/lib/tour-steps";
import { cn } from "@/lib/utils";

type Rect = { top: number; left: number; width: number; height: number };

const PADDING = 8;
const MARGIN = 12;
const PERKIRAAN_TINGGI_TOOLTIP = 210;

function cariTarget(selector?: string): HTMLElement | null {
  if (!selector) return null;
  const semua = Array.from(document.querySelectorAll<HTMLElement>(selector));
  return semua.find((el) => el.offsetParent !== null) ?? null;
}

export function TourOverlay({
  langkahIndex,
  onUbahLangkah,
  onSelesai,
}: {
  langkahIndex: number;
  onUbahLangkah: (index: number) => void;
  onSelesai: (tandaiSelesai?: boolean) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [rect, setRect] = useState<Rect | null>(null);
  const step = TOUR_STEPS[langkahIndex];

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => setMounted(true), []);

  // Kalau target langkah ini tidak ada di halaman saat ini (mis. tour
  // diulang dari halaman lain), lompati otomatis ke langkah valid berikutnya.
  useEffect(() => {
    if (!step) {
      onSelesai();
      return;
    }
    if (step.selector && !cariTarget(step.selector)) {
      if (langkahIndex < TOUR_STEPS.length - 1) {
        onUbahLangkah(langkahIndex + 1);
      } else {
        onSelesai();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [langkahIndex]);

  useLayoutEffect(() => {
    if (!step?.selector) {
      setRect(null);
      return;
    }
    /* eslint-enable react-hooks/set-state-in-effect */

    function ukur() {
      const el = cariTarget(step.selector);
      if (!el) return;
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    }

    ukur();
    window.addEventListener("resize", ukur);
    window.addEventListener("scroll", ukur, true);
    const interval = setInterval(ukur, 250);
    return () => {
      window.removeEventListener("resize", ukur);
      window.removeEventListener("scroll", ukur, true);
      clearInterval(interval);
    };
  }, [step]);

  if (!mounted || !step) return null;

  const total = TOUR_STEPS.length;
  const isFirst = langkahIndex === 0;
  const isLast = langkahIndex === total - 1;

  const spotlight = rect
    ? {
        top: rect.top - PADDING,
        left: rect.left - PADDING,
        width: rect.width + PADDING * 2,
        height: rect.height + PADDING * 2,
      }
    : null;

  const viewportW = typeof window !== "undefined" ? window.innerWidth : 360;
  const viewportH = typeof window !== "undefined" ? window.innerHeight : 640;
  const lebarTooltip = Math.min(320, viewportW - MARGIN * 2);

  let tooltipTop = 0;
  let tooltipLeft = MARGIN;
  if (spotlight) {
    if (
      spotlight.top + spotlight.height + MARGIN + PERKIRAAN_TINGGI_TOOLTIP <=
      viewportH
    ) {
      tooltipTop = spotlight.top + spotlight.height + MARGIN;
    } else if (spotlight.top - MARGIN - PERKIRAAN_TINGGI_TOOLTIP >= 0) {
      tooltipTop = spotlight.top - MARGIN - PERKIRAAN_TINGGI_TOOLTIP;
    } else {
      tooltipTop = Math.max(
        MARGIN,
        viewportH - PERKIRAAN_TINGGI_TOOLTIP - MARGIN,
      );
    }
    tooltipLeft = Math.min(
      Math.max(spotlight.left + spotlight.width / 2 - lebarTooltip / 2, MARGIN),
      viewportW - lebarTooltip - MARGIN,
    );
  }

  const kartu = (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-black/5 dark:bg-zinc-900",
        !spotlight && "w-full max-w-sm p-5",
      )}
      style={spotlight ? { width: lebarTooltip } : undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
          {step.title}
        </p>
        <button
          type="button"
          aria-label="Lewati tour"
          onClick={() => onSelesai(true)}
          className="-m-1 shrink-0 rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
        >
          <FontAwesomeIcon icon={faXmark} className="size-3.5" />
        </button>
      </div>

      <p className="text-sm text-zinc-600 dark:text-zinc-400">{step.body}</p>

      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-1">
          {TOUR_STEPS.map((s, i) => (
            <span
              key={s.id}
              className={cn(
                "size-1.5 rounded-full transition-colors",
                i === langkahIndex
                  ? "bg-sky-500"
                  : "bg-zinc-200 dark:bg-zinc-700",
              )}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          {!isFirst && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => onUbahLangkah(langkahIndex - 1)}
            >
              <FontAwesomeIcon icon={faArrowLeft} className="size-3" />
              Kembali
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            className="bg-sky-500 hover:bg-sky-600"
            onClick={() =>
              isLast ? onSelesai(true) : onUbahLangkah(langkahIndex + 1)
            }
          >
            {isLast ? "Mulai Sekarang" : "Lanjut"}
            {!isLast && (
              <FontAwesomeIcon icon={faArrowRight} className="size-3" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true">
      {spotlight ? (
        <>
          <div
            className="fixed rounded-2xl transition-all duration-300 ease-out"
            style={{
              top: spotlight.top,
              left: spotlight.left,
              width: spotlight.width,
              height: spotlight.height,
              // Digabung jadi satu box-shadow: cincin putih di sekeliling target
              // + area gelap 9999px di luar target (efek spotlight/masking).
              boxShadow:
                "0 0 0 3px rgba(255, 255, 255, 0.95), 0 0 0 9999px rgba(15, 23, 42, 0.72)",
            }}
          />
          {/* Cegah interaksi dengan halaman di belakang selama tour berjalan */}
          <div
            className="fixed inset-0"
            onClick={(e) => e.preventDefault()}
            onWheel={(e) => e.preventDefault()}
          />
        </>
      ) : (
        <div className="fixed inset-0 bg-slate-900/70" />
      )}

      {spotlight ? (
        <div
          className="fixed z-[101] transition-all duration-300 ease-out"
          style={{ top: tooltipTop, left: tooltipLeft }}
        >
          {kartu}
        </div>
      ) : (
        <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
          {kartu}
        </div>
      )}
    </div>,
    document.body,
  );
}
