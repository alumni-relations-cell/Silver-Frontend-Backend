import { useEffect, useRef, useState } from "react";

/* -------------------------- Data -------------------------- */
const events = [
  { title: "Alumni Reunion — Event Flow", desc: "Two-day reunion at TI campus.", date: "Dec 2025" },
  { title: "Welcome & Registration", desc: "Check-in at Hostel M Mess and settle into rooms.", date: "Day 1 • 10:00 AM – 2:00 PM" },
  { title: "Lunch at Hostel M Mess", desc: "Hearty lunch while alumni arrive safely.", date: "Day 1 • 12:30 PM – 2:00 PM" },
  { title: "Walk to Remember + Inauguration", desc: "Procession from Hostel M to Main Auditorium with Bhangra team; official inauguration.", date: "Day 1 • 3:00 PM (sharp)" },

  { title: "Morning Bliss", desc: "Optional: Visit to Gurdwara Dukh Niwaran Sahib / campus walk (Kali Mata Mandir) / yoga session.", date: "Day 2 • 6:30 AM – 8:30 AM" },
  { title: "Breakfast", desc: "Leisurely breakfast at Hostel M Mess.", date: "Day 2 • 8:00 AM – 9:30 AM" },
  { title: "Back to the Classroom", desc: "Fun MCQ quiz + interaction with favourite faculty.", date: "Day 2 • 10:00 AM – 11:30 AM" },
  { title: "Campus Stroll & Activities", desc: "Revisit corners of campus; sports & games; soak in how the campus has grown.", date: "Day 2 • 11:30 AM – 1:00 PM" },
  { title: "Faculty–Alumni Lunch", desc: "Lunch with faculty at Hostel M.", date: "Day 2 • 1:00 PM – 2:30 PM" },
  { title: "Farewell & Goodbyes", desc: "Wrap-up and depart with warm memories.", date: "Day 2 • 2:30 PM" },
];

/* -------------------- Snow Overlay (Canvas) -------------------- */
function SnowOverlay({ density = 140 }) {
  const canvasRef = useRef(null);
  const rafRef = useRef();
  const particlesRef = useRef([]);
  const reduceMotion = useRef(false);

  const resize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const { clientWidth, clientHeight } = canvas;
    canvas.width = Math.floor(clientWidth * dpr);
    canvas.height = Math.floor(clientHeight * dpr);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const setupParticles = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const count = Math.max(40, Math.floor((width * height) / 25000));
    const target = Math.min(density, count);

    particlesRef.current = Array.from({ length: target }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 0.8 + Math.random() * 2.2,
      spdY: 0.35 + Math.random() * 0.9,
      spdX: -0.3 + Math.random() * 0.6,
      sway: Math.random() * 2 * Math.PI,
      swayAmp: 0.6 + Math.random() * 1.0,
      alpha: 0.65 + Math.random() * 0.35,
    }));
  };

  useEffect(() => {
    reduceMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const canvas = canvasRef.current;
    if (!canvas || reduceMotion.current) return;

    resize();
    setupParticles();
    const ctx = canvas.getContext("2d");

    const step = () => {
      const { clientWidth: width, clientHeight: height } = canvas;
      ctx.clearRect(0, 0, width, height);

      particlesRef.current.forEach(p => {
        p.sway += 0.01;
        p.y += p.spdY;
        p.x += p.spdX + Math.sin(p.sway) * p.swayAmp * 0.2;

        if (p.y > height + 6) {
          p.y = -6;
          p.x = Math.random() * width;
        }
        if (p.x > width + 6) p.x = -6;
        if (p.x < -6) p.x = width + 6;

        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);

    const onResize = () => {
      resize();
      setupParticles();
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(canvas);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [density]);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 w-full h-full opacity-80" aria-hidden="true" />;
}

/* -------------------------- Timeline -------------------------- */
const Timeline = () => {
  const containerRef = useRef(null);
  const itemRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let frame;

    const computeActive = () => {
      const cRect = container.getBoundingClientRect();
      const cTop = cRect.top;
      const cBottom = cRect.bottom;
      const cHeight = cRect.height;
      const focusY = cTop + cHeight * 0.45;

      let bestIdx = 0;
      let bestScore = -Infinity;

      const MIN_VISIBLE_PX = 8;
      const EDGE_EPS = 0.5;

      itemRefs.current.forEach((el, idx) => {
        if (!el) return;
        const r = el.getBoundingClientRect();

        const visible = Math.max(0, Math.min(r.bottom, cBottom) - Math.max(r.top, cTop));
        if (visible < MIN_VISIBLE_PX) return;

        const itemCenter = r.top + r.height / 2;
        const half = cHeight / 2 || 1;
        const distNorm = Math.min(1, Math.abs(itemCenter - focusY) / half);
        const visibleRatio = r.height > 0 ? Math.min(1, visible / r.height) : 0;

        const score = (1 - distNorm) * 0.7 + visibleRatio * 0.3;

        if (score > bestScore) {
          bestScore = score;
          bestIdx = idx;
        }
      });

      const atTop = container.scrollTop <= EDGE_EPS;
      const maxScroll = container.scrollHeight - container.clientHeight;
      const atBottom = container.scrollTop >= maxScroll - EDGE_EPS;

      if (atTop) bestIdx = 0;
      if (atBottom) bestIdx = events.length - 1;
      setActiveIndex(bestIdx);
    };

    const onScroll = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(computeActive);
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    container.scrollTo({ top: 0, left: 0, behavior: "instant" });
    computeActive();
    const onResize = () => computeActive();
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      container.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="relative h-screen overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-gray-900 via-black to-gray-900" />

      <SnowOverlay density={160} />

      <div
        ref={containerRef}
        className="relative z-10 flex-1 overflow-y-scroll h-screen pt-24 pb-24 space-y-20 scroll-smooth no-scrollbar snap-y snap-mandatory text-white"
      >
        {events.map((event, i) => {
          const isActive = i === activeIndex;
          const distance = Math.abs(i - activeIndex);

          let opacity = 1;
          let scale = 1;
          let blur = 0;

          if (!isActive) {
            opacity = Math.max(0.55, 1 - distance * 0.25);
            scale = Math.max(0.96, 1 - distance * 0.03);
            blur = Math.min(3, distance * 1.2);
          }

          return (
            <div
              key={i}
              ref={(el) => (itemRefs.current[i] = el)}
              className="snap-center transition-all duration-700 ease-in-out max-w-3xl mx-auto px-6"
              style={{
                opacity,
                transform: `scale(${scale})`,
                filter: `blur(${blur}px)`,
              }}
            >
              <div
                className={`relative rounded-xl p-6 backdrop-blur-md transition-all duration-700 border-l-4
                  ${isActive
                    ? "bg-gray-800/70 border-cyan-400 shadow-[0_0_40px_rgba(56,189,248,0.22)]"
                    : "bg-gray-800/40 border-transparent"
                  }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h2
                        className={`text-xl font-semibold transition-colors
                          ${isActive ? "text-cyan-400" : "text-gray-200"}`}
                      >
                        {event.title}
                      </h2>
                      <span
                        className={`text-xs font-mono px-2 py-0.5 rounded-full transition-colors
                          ${isActive
                            ? "bg-cyan-400/20 text-cyan-300"
                            : "bg-gray-700 text-gray-400"
                          }`}
                      >
                        {event.date}
                      </span>
                    </div>
                    <p
                      className={`text-sm transition-colors
                        ${isActive ? "text-gray-100" : "text-gray-400"}`}
                    >
                      {event.desc}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Timeline;
