"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Options = {
  contentWidth: number;
  contentHeight: number;
  /** Breathing room around the content when fitting, in CSS px. */
  padding?: number;
  minScale?: number;
  maxScale?: number;
};

/**
 * Zoom via CSS transform, pan via native scrolling.
 *
 * Deliberately not a full custom transform system: letting the browser own the
 * panning means momentum scrolling, trackpad gestures and — the reason that
 * matters most here — `scrollIntoView` on keyboard focus all work for free.
 *
 * Scale is derived, never stored directly: `scale = fitScale × factor`, where
 * `fitScale` always tracks the container size and `factor` is the visitor's own
 * zoom. Storing the product instead would leave a manual zoom stale the moment
 * the window resized.
 */
export function usePanZoom({
  contentWidth,
  contentHeight,
  padding = 24,
  minScale = 0.2,
  maxScale = 2.5,
}: Options) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [fitScale, setFitScale] = useState(0.5);
  const [factor, setFactor] = useState(1);

  const scale = Math.min(maxScale, Math.max(minScale, fitScale * factor));
  const scaleRef = useRef(scale);
  scaleRef.current = scale;

  const measureFit = useCallback(() => {
    const el = containerRef.current;
    if (!el) return 1;
    const w = el.clientWidth - padding * 2;
    const h = el.clientHeight - padding * 2;
    if (w <= 0 || h <= 0) return 1;
    return Math.min(w / contentWidth, h / contentHeight);
  }, [contentWidth, contentHeight, padding]);

  const centre = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
      el.scrollTop = (el.scrollHeight - el.clientHeight) / 2;
    });
  }, []);

  const fit = useCallback(() => {
    setFactor(1);
    centre();
  }, [centre]);

  /** Change zoom while keeping a client point pinned under the cursor. */
  const zoomBy = useCallback(
    (mult: number, clientX?: number, clientY?: number) => {
      const el = containerRef.current;
      const before = scaleRef.current;
      setFactor((f) => {
        const nextScale = Math.min(
          maxScale,
          Math.max(minScale, fitScale * f * mult),
        );
        if (el && nextScale !== before) {
          const rect = el.getBoundingClientRect();
          const px = (clientX ?? rect.left + rect.width / 2) - rect.left;
          const py = (clientY ?? rect.top + rect.height / 2) - rect.top;
          const ratio = nextScale / before;
          const nextLeft = (el.scrollLeft + px) * ratio - px;
          const nextTop = (el.scrollTop + py) * ratio - py;
          requestAnimationFrame(() => {
            el.scrollLeft = nextLeft;
            el.scrollTop = nextTop;
          });
        }
        return (nextScale / fitScale) as number;
      });
    },
    [fitScale, maxScale, minScale],
  );

  const zoomIn = useCallback(() => zoomBy(1.25), [zoomBy]);
  const zoomOut = useCallback(() => zoomBy(1 / 1.25), [zoomBy]);

  /* Track the container size; fitScale follows it for the life of the page. */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setFitScale(measureFit());
    update();
    centre();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [measureFit, centre]);

  /* Ctrl/⌘ + wheel and trackpad pinch. Plain wheel stays native scrolling. */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    function onWheel(e: WheelEvent) {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      zoomBy(Math.exp(-e.deltaY / 260), e.clientX, e.clientY);
    }
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomBy]);

  /* Two-finger pinch on touch devices. */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let lastDist = 0;

    const dist = (t: TouchList) =>
      Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);

    function onStart(e: TouchEvent) {
      if (e.touches.length === 2) lastDist = dist(e.touches);
    }
    function onMove(e: TouchEvent) {
      if (e.touches.length !== 2 || lastDist === 0) return;
      e.preventDefault();
      const d = dist(e.touches);
      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      zoomBy(d / lastDist, midX, midY);
      lastDist = d;
    }
    function onEnd() {
      lastDist = 0;
    }

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd);
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
    };
  }, [zoomBy]);

  /* Middle-drag and shift-drag pan for mouse users who have zoomed in.
     Plain left-drag is left alone so tiles stay clickable. */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let panning = false;
    let sx = 0;
    let sy = 0;
    let sl = 0;
    let st = 0;

    function onDown(e: PointerEvent) {
      if (e.button !== 1 && !(e.button === 0 && e.shiftKey)) return;
      panning = true;
      sx = e.clientX;
      sy = e.clientY;
      sl = el!.scrollLeft;
      st = el!.scrollTop;
      el!.setPointerCapture(e.pointerId);
      el!.style.cursor = "grabbing";
      e.preventDefault();
    }
    function onMove(e: PointerEvent) {
      if (!panning) return;
      el!.scrollLeft = sl - (e.clientX - sx);
      el!.scrollTop = st - (e.clientY - sy);
    }
    function onUp() {
      panning = false;
      el!.style.cursor = "";
    }

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
    };
  }, []);

  return {
    containerRef,
    scale,
    fitScale,
    isFitted: Math.abs(factor - 1) < 0.01,
    zoomIn,
    zoomOut,
    fit,
  };
}

export default usePanZoom;
