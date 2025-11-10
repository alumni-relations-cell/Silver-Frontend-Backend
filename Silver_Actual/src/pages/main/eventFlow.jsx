import { useEffect, useRef, useState } from "react";

const events = [
  { title: "Alumni Reunion — Event Flow", desc: "Two-day reunion at TI campus.", date: "Dec 2025" },

  // Day 1 — Saturday (per PDF)
  { title: "Welcome & Registration", desc: "Check-in at Hostel M Mess and settle into rooms.", date: "Day 1 • 10:00 AM – 2:00 PM" },
  { title: "Lunch at Hostel M Mess", desc: "Hearty lunch while alumni arrive safely.", date: "Day 1 • 12:30 PM – 2:00 PM" },
  { title: "Walk to Remember + Inauguration", desc: "Procession from Hostel M to Main Auditorium with Bhangra team; official inauguration.", date: "Day 1 • 3:00 PM (sharp)" },

  // Day 2 — Sunday (per PDF)
  { title: "Morning Bliss", desc: "Optional: Visit to Gurdwara Dukh Niwaran Sahib / campus walk (Kali Mata Mandir) / yoga session.", date: "Day 2 • 6:30 AM – 8:30 AM" },
  { title: "Breakfast", desc: "Leisurely breakfast at Hostel M Mess.", date: "Day 2 • 8:00 AM – 9:30 AM" },
  { title: "Back to the Classroom", desc: "Fun MCQ quiz + interaction with favourite faculty.", date: "Day 2 • 10:00 AM – 11:30 AM" },
  { title: "Campus Stroll & Activities", desc: "Revisit corners of campus; sports & games; soak in how the campus has grown.", date: "Day 2 • 11:30 AM – 1:00 PM" },
  { title: "Faculty–Alumni Lunch", desc: "Lunch with faculty at Hostel M.", date: "Day 2 • 1:00 PM – 2:30 PM" },
  { title: "Farewell & Goodbyes", desc: "Wrap-up and depart with warm memories.", date: "Day 2 • 2:30 PM" },
];

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

      // Focus line slightly above middle to reduce double-center conflicts on large screens
      const focusY = cTop + cHeight * 0.45;

      let bestIdx = 0;
      let bestScore = -Infinity;

      // Ignore slivers at edges
      const MIN_VISIBLE_PX = 8;
      // Very small clamp tolerance so 2nd and 2nd-last can still win near edges
      const EDGE_EPS = 0.5;

      itemRefs.current.forEach((el, idx) => {
        if (!el) return;
        const r = el.getBoundingClientRect();

        // Visible height within container viewport
        const visible = Math.max(0, Math.min(r.bottom, cBottom) - Math.max(r.top, cTop));
        if (visible < MIN_VISIBLE_PX) return;

        const itemCenter = r.top + r.height / 2;

        // Center distance normalized to [0,1]
        const half = cHeight / 2 || 1;
        const distNorm = Math.min(1, Math.abs(itemCenter - focusY) / half);

        // Visibility ratio [0,1]
        const visibleRatio = r.height > 0 ? Math.min(1, visible / r.height) : 0;

        // Blend: prioritize closeness to focus line, then visibility (helps 2nd/2nd-last)
        const score = (1 - distNorm) * 0.7 + visibleRatio * 0.3;

        if (score > bestScore) {
          bestScore = score;
          bestIdx = idx;
        }
      });

      // Clamp only at true extremes (don’t steal activation from second/second-last)
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

    // Start at first item, compute once
    container.scrollTo({ top: 0, left: 0, behavior: "instant" });
    computeActive();

    // Recompute on resize (handles very large/small screens)
    const onResize = () => computeActive();
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      container.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="flex bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white h-screen overflow-hidden relative">
      <div
        ref={containerRef}
        className="flex-1 overflow-y-scroll h-screen pt-24 pb-24 space-y-20 scroll-smooth no-scrollbar snap-y snap-mandatory"
      >
        {events.map((event, i) => {
          const isActive = i === activeIndex;
          const distance = Math.abs(i - activeIndex);

          let opacity = 1;
          let scale = 1;
          let blur = 0;

          if (!isActive) {
            opacity = Math.max(0.5, 1 - distance * 0.25);
            scale = Math.max(0.95, 1 - distance * 0.03);
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
                className={`relative ${
                  isActive
                    ? "bg-gradient-to-r from-gray-800/70 to-gray-900/70 border-l-4 border-cyan-400 shadow-xl shadow-cyan-400/20"
                    : "bg-gray-800/40 border-l-4 border-transparent"
                } rounded-xl p-6 backdrop-blur-md transition-all duration-700`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h2
                        className={`text-xl font-semibold ${
                          isActive ? "text-cyan-400" : "text-gray-300"
                        } transition-colors`}
                      >
                        {event.title}
                      </h2>
                      <span
                        className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                          isActive
                            ? "bg-cyan-400/20 text-cyan-300"
                            : "bg-gray-700 text-gray-400"
                        }`}
                      >
                        {event.date}
                      </span>
                    </div>
                    <p
                      className={`text-sm ${
                        isActive ? "text-gray-200" : "text-gray-500"
                      } transition-colors`}
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
