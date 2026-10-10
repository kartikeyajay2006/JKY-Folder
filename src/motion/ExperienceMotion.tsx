import { useEffect } from 'react';
import { useMotion } from './MotionProvider';
const surfaces = '.starter-tile,.opportunity-card,.setup-step,.method-grid article,.packet-visual';
const sections =
  '.welcome-method,.welcome-evidence,.welcome-account-section,.starter-section,.setup-section';
export function ExperienceMotion() {
  const { active } = useMotion();
  useEffect(() => {
    if (!active) return;
    const root = document.getElementById('root');
    if (!root) return;
    const seen = new WeakSet<Element>(),
      running = new Set<Animation>(),
      observed = new Set<Element>();
    const intersection = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const element = entry.target as HTMLElement;
          if (element.matches('.packet-visual')) {
            element.classList.toggle('is-motion-visible', entry.isIntersecting);
            continue;
          }
          if (!entry.isIntersecting) continue;
          intersection.unobserve(element);
          if (seen.has(element)) continue;
          seen.add(element);
          const animation = element.animate(
            [
              { opacity: 0, transform: 'translateY(18px)' },
              { opacity: 1, transform: 'translateY(0)' },
            ],
            { duration: 550, easing: 'cubic-bezier(.22,1,.36,1)' },
          );
          running.add(animation);
          void animation.finished
            .then(() => running.delete(animation))
            .catch(() => running.delete(animation));
        }
      },
      { threshold: 0.12 },
    );
    const observe = () => {
      root.querySelectorAll(`${sections},.packet-visual`).forEach((element) => {
        if (!observed.has(element)) {
          observed.add(element);
          intersection.observe(element);
        }
      });
    };
    observe();
    const mutations = new MutationObserver((records) => {
      const changed = records.some((record) =>
        Array.from(record.addedNodes).some(
          (node) =>
            node instanceof Element &&
            (node.matches(`${sections},.packet-visual`) ||
              node.querySelector(`${sections},.packet-visual`)),
        ),
      );
      if (changed) {
        for (const element of observed) {
          if (!root.contains(element)) {
            intersection.unobserve(element);
            observed.delete(element);
          }
        }
        observe();
      }
    });
    mutations.observe(root, { childList: true, subtree: true });
    const fine = matchMedia('(hover:hover) and (pointer:fine)');
    let frame = 0,
      surface: HTMLElement | null = null,
      point = { x: 0, y: 0 };
    function reset() {
      if (!surface) return;
      surface.style.removeProperty('--pointer-x');
      surface.style.removeProperty('--pointer-y');
      surface.style.removeProperty('--tilt-x');
      surface.style.removeProperty('--tilt-y');
      surface = null;
    }
    function move(event: PointerEvent) {
      if (!fine.matches || event.pointerType === 'touch') return;
      const target = (event.target as Element).closest<HTMLElement>(surfaces);
      if (target !== surface) {
        reset();
        surface = target;
      }
      if (!surface) return;
      point = { x: event.clientX, y: event.clientY };
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (!surface) return;
        const rect = surface.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (point.x - rect.left) / rect.width)),
          y = Math.max(0, Math.min(1, (point.y - rect.top) / rect.height));
        surface.style.setProperty('--pointer-x', `${x * 100}%`);
        surface.style.setProperty('--pointer-y', `${y * 100}%`);
        surface.style.setProperty('--tilt-x', `${(0.5 - y) * 3}deg`);
        surface.style.setProperty('--tilt-y', `${(x - 0.5) * 3}deg`);
      });
    }
    function out(event: PointerEvent) {
      if (surface && !surface.contains(event.relatedTarget as Node)) reset();
    }
    function ripple(event: PointerEvent) {
      const button = (event.target as Element).closest<HTMLElement>('.primary,.outline');
      if (!button || button.matches(':disabled')) return;
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      const pulse = document.createElement('span');
      pulse.className = 'button-ripple';
      pulse.setAttribute('aria-hidden', 'true');
      pulse.style.cssText = `width:${size}px;height:${size}px;left:${event.clientX - rect.left - size / 2}px;top:${event.clientY - rect.top - size / 2}px`;
      button.append(pulse);
      const animation = pulse.animate(
        [
          { opacity: 0.22, transform: 'scale(0)' },
          { opacity: 0, transform: 'scale(1)' },
        ],
        { duration: 480, easing: 'ease-out' },
      );
      running.add(animation);
      void animation.finished
        .finally(() => {
          running.delete(animation);
          pulse.remove();
        })
        .catch(() => {});
    }
    const visibility = () => {
      document.documentElement.dataset.motionVisibility = document.hidden ? 'hidden' : 'visible';
    };
    visibility();
    root.addEventListener('pointermove', move);
    root.addEventListener('pointerout', out);
    root.addEventListener('pointerdown', ripple);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      intersection.disconnect();
      mutations.disconnect();
      cancelAnimationFrame(frame);
      reset();
      root.removeEventListener('pointermove', move);
      root.removeEventListener('pointerout', out);
      root.removeEventListener('pointerdown', ripple);
      document.removeEventListener('visibilitychange', visibility);
      running.forEach((a) => a.cancel());
      root
        .querySelectorAll('.is-motion-visible')
        .forEach((e) => e.classList.remove('is-motion-visible'));
      root.querySelectorAll('.button-ripple').forEach((e) => e.remove());
    };
  }, [active]);
  return null;
}
