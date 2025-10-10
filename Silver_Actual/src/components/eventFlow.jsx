import { useEffect, useRef, useState } from "react";

const events = [
  { title: "   Event Flow   ", desc: "  ", date: "      " },
  { title: "Production", desc: "Started production of key assets.", date: "1. Oct" },
  { title: "Whitelist Launch", desc: "Whitelist opens for active members.", date: "End of Nov" },
  { title: "Whitelist Minting", desc: "Early access for whitelisted users.", date: "TBA" },
  { title: "Public Minting", desc: "Open minting begins.", date: "TBA" },
  { title: "Reveal Day", desc: "Reveal the minted items!", date: "TBA" },
  { title: "Community Airdrop", desc: "Airdrop to engaged users.", date: "TBA" },
  { title: "Governance Voting", desc: "DAO voting begins.", date: "TBA" },
  { title: "Future Expansion", desc: "Next collection teasers.", date: "TBA" },
  { title: "Game Trailer", desc: "Game reveal trailer.", date: "TBA" },
];

const Timeline = () => {
  const containerRef = useRef(null);
  const itemRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let frame;

    const handleScroll = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const scrollTop = container.scrollTop;
        const containerHeight = container.clientHeight;
        const scrollHeight = container.scrollHeight;
        const centerY = scrollTop + containerHeight / 2;

        let closest = 0;
        let minDiff = Infinity;

        itemRefs.current.forEach((ref, idx) => {
          if (!ref) return;
          const offsetTop = ref.offsetTop;
          const offsetHeight = ref.offsetHeight;
          const itemCenter = offsetTop + offsetHeight / 2;
          const diff = Math.abs(centerY - itemCenter);

          if (diff < minDiff) {
            minDiff = diff;
            closest = idx;
          }
        });

        // ✅ Fix first and last event
        if (scrollTop === 0) closest = 0;
        else if (scrollTop + containerHeight >= scrollHeight - 1) closest = events.length - 1;

        setActiveIndex(closest);
      });
    };

    container.addEventListener("scroll", handleScroll);

    // Initial call
    handleScroll();

    return () => {
      container.removeEventListener("scroll", handleScroll);
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
