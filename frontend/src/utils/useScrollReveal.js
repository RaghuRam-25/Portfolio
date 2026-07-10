import { useEffect, useRef } from 'react';

/**
 * useScrollReveal — একটি custom hook যা IntersectionObserver ব্যবহার করে
 * সব `.scroll-reveal` ক্লাসের এলিমেন্টে `.revealed` ক্লাস যোগ করে।
 *
 * ব্যবহার:
 * const sectionRef = useScrollReveal();
 * <section ref={sectionRef}> ... <div className="scroll-reveal"> ... </div> ... </section>
 */
export default function useScrollReveal(options = {}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const elements = container.querySelectorAll('.scroll-reveal');
    if (elements.length === 0) return;

    const observerOptions = {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
      ...options,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          // একবার দেখানোর পর observe বন্ধ করা — Performance এর জন্য
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return containerRef;
}
