import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { gsap } from 'gsap';


export default function HeroIntro({ onComplete, profile }) {
  const containerRef = useRef(null);
  const flashRef = useRef(null);
  const imageWrapperRef = useRef(null);
  const detailsRef = useRef(null);

  const [animationPhase, setAnimationPhase] = useState('dark');

  // মাউস ট্র্যাকিং কণার জন্য ফ্রেমার মোশন ভ্যারিয়েবল (Awwwards Feature)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 60, damping: 15 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 15 });

  useEffect(() => {
    // মাউস মুভমেন্ট লিসেনার
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      // স্ক্রিনের সেন্টার থেকে মাউসের দূরত্ব হিসাব
      mouseX.set((clientX - innerWidth / 2) * 0.15);
      mouseY.set((clientY - innerHeight / 2) * 0.15);
    };

    window.addEventListener('mousemove', handleMouseMove);

    // গুগল ফন্ট লোড
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Alex+Brush&family=Plus+Jakarta+Sans:wght@400;700;900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // যদি প্রোফাইল ডেটা না থাকে, তাহলে অ্যানিমেশন শুরু হবে না।
    if (!profile) {
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.delayedCall(0, onComplete); // সব শেষে ৩ সেকেন্ড হোল্ড করবে
        }
      });

      // ১. শুরুতে ডার্ক স্ক্রিন
      tl.to(containerRef.current, { opacity: 1, duration: 0.1 });

      // Q৩. এনার্জি গ্যাদারিং ও ক্রিস্টাল ক্লিয়ার ইমেজ
      tl.add(() => setAnimationPhase('reveal'), "+=0.8");

      tl.fromTo(imageWrapperRef.current,
        { scale: 0.6, filter: "brightness(5) blur(30px) contrast(250%)", opacity: 0 },
        { scale: 1, filter: "brightness(1) blur(0px) contrast(100%)", opacity: 1, duration: 2.8, ease: "power4.out" }
      );

      // ৪. ডিটেইলস ও বাকি টেক্সটের স্মুথ এন্ট্রি
      tl.fromTo(detailsRef.current,
        { opacity: 0, y: 50, filter: "blur(15px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.8, ease: "elastic.out(1, 0.75)" },
        "-=0.4"
      );

    }, containerRef);

    return () => {
      ctx.revert();
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [onComplete, mouseX, mouseY, profile]);

  // ২৫টি ইন্টারেক্টিভ কণা
  const particles = Array.from({ length: 30 }, (_, index) => ({
    id: index,
    size: 2 + (index % 4),
    left: `${(index * 7) % 100}%`,
    top: `${(index * 11) % 100}%`,
  }));

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#02040a] select-none overflow-hidden"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* ফিউচারিস্টিক গ্রিড ব্যাকগ্রাউন্ড */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.15)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      {/* লাইটনিং ফ্ল্যাশ */}
      <div ref={flashRef} className="absolute inset-0 bg-cyan-200 pointer-events-none opacity-0 z-10 mix-blend-overlay" />

      {/* মেইন ৩D বিজলি থ্রেড (বাম এবং ডান উভয় দিকেই সিমেট্রিক্যালি শো করার জন্য ডুপ্লিকেট করা হয়েছে) */}

      {/* কন্টেন্ট বক্স */}
      <div className="relative flex flex-col items-center justify-center max-w-4xl text-center px-6 z-30">

        {/* রিং এফেক্টসহ ইমেজ */}
        <div className="relative w-48 h-48 md:w-56 md:h-56 mb-8 flex items-center justify-center">
          {animationPhase !== 'dark' && (
            <motion.div
              className="absolute -inset-6 rounded-full border-2 border-dashed border-cyan-500/30 filter blur-[0.5px]"
              animate={{ rotate: -360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            />
          )}

          <div
            ref={imageWrapperRef}
            className="w-full h-full rounded-full overflow-hidden border-2 border-cyan-400/40 shadow-[0_0_50px_rgba(6,182,212,0.3)] bg-neutral-900 opacity-0"
          >
            <img
              src={profile?.heroSection?.heroImageUrl || profile?.avatarUrl || 'https://via.placeholder.com/400'}
              alt="Profile Avatar"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* হাতের লেখায় বোল্ড নাম (Alex Brush + কাস্টম স্ট্রোক) */}
        <div className="h-24 w-[320px] md:w-[500px] flex items-center justify-center overflow-visible">
          <svg viewBox="0 0 500 100" className="w-full h-full overflow-visible">
            <text
              x="50%"
              y="65%"
              textAnchor="middle"
              className="drawn-text text-6xl md:text-7xl font-black tracking-wider fill-none stroke-cyan-400 stroke-[2]" // stroke-[2] দিয়ে বর্ডার বোল্ড করেছি
              style={{
                fontFamily: "'Alex Brush', 'Palace Script MT', cursive",
                strokeDasharray: '1200',
                strokeDashoffset: '1200',
              }}
            >
              {profile?.name || 'Portfolio'}
            </text>
          </svg>
        </div>

        {/* টাইটেল ও সাব-টেক্সট */}
        <div ref={detailsRef} className="space-y-4 max-w-xl opacity-0">
          <h2 className="text-sm md:text-base font-black tracking-[0.3em] uppercase text-cyan-400 filter drop-shadow-[0_0_6px_rgba(34,211,238,0.5)]">
            Full-Stack Developer & Software Engineer
          </h2>
          <p className="text-xs md:text-sm text-neutral-400 leading-relaxed max-w-md mx-auto font-medium">
            Crafting high-performance web applications and cinematic digital experiences with modern code ecosystems.
          </p>
        </div>

      </div>
    </div>
  );
}