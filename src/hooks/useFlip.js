import { useLayoutEffect, useRef } from 'react';

// Animación FLIP: cuando cambia `key`, cada hijo [data-fid] se desliza desde su posición anterior.
// Respeta prefers-reduced-motion.
export default function useFlip(ref, key) {
  const prev = useRef({});
  useLayoutEffect(() => {
    const el = ref.current; if (!el) return;
    const kids = el.querySelectorAll('[data-fid]'), next = {};
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    kids.forEach((k) => { next[k.getAttribute('data-fid')] = k.offsetTop; });
    if (!reduce) kids.forEach((k) => {
      const id = k.getAttribute('data-fid'), d = prev.current[id] != null ? prev.current[id] - next[id] : 0;
      if (d) {
        k.style.transition = 'none'; k.style.transform = 'translateY(' + d + 'px)'; k.getBoundingClientRect();
        k.style.transition = 'transform .35s cubic-bezier(.2,.8,.2,1)'; k.style.transform = '';
      }
    });
    prev.current = next;
  }, [key]);
}
