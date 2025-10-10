import { useState, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./home.css";

function Home() {
  const [posterImages, setPosterImages] = useState([]);
  const [jubileeImages, setJubileeImages] = useState([]);
  const token = localStorage.getItem("adminToken");

  /* -------------------------------------------------
   *  Fetch images from backend
   * ------------------------------------------------- */
  useEffect(() => {
    // Posters
    fetch("http://localhost:5000/api/admin/images?category=home_announcement", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((data) =>
        setPosterImages([...new Set(data.map((img) => img.url))]) // remove duplicates
      )
      .catch((err) => console.error("Error fetching poster images:", err));

    // Memories
    fetch("http://localhost:5000/api/admin/images?category=home_memories", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((data) =>
        setJubileeImages([...new Set(data.map((img) => img.url))]) // remove duplicates
      )
      .catch((err) => console.error("Error fetching memories images:", err));
  }, []);

  /* -------------------------------------------------
   *  Falling-stars background
   * ------------------------------------------------- */
  useEffect(() => {
    const background = document.getElementById("background-container");
    if (!background) return;

    background.innerHTML = "";
    const starCount = 150;
    for (let i = 0; i < starCount; i++) {
      const star = document.createElement("div");
      star.className = "star";
      star.style.left = `${Math.random() * 100}vw`;
      star.style.animationDuration = `${Math.random() * 3 + 3}s`;
      star.style.animationDelay = `${Math.random() * 5}s`;
      background.appendChild(star);
    }

    return () => {
      if (background) background.innerHTML = "";
    };
  }, []);

  /* -------------------------------------------------
   *  Slider settings
   * ------------------------------------------------- */
  const posterSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 4000,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    centerMode: true,
    centerPadding: "0px",
  };

  const jubileeSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 2000,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: false,
    responsive: [
      {
        breakpoint: 768,
        settings: { slidesToShow: 1 },
      },
    ],
  };

  /* -------------------------------------------------
   *  Marquee data
   * ------------------------------------------------- */
  const marqueeLinks = [
    { href: "/register", text: "Register Now" },
    { href: "/schedule", text: "View Event Schedule" },
    { href: "/speakers", text: "Meet the Speakers" },
    { href: "/gallery", text: "View Gallery" },
    { href: "/meetourteam", text: "Meet ARC Team" },
  ];

  return (
    <>
      <div id="background-container"></div>

      <div className="page-content">
        {/* Hero Section */}
        <div className="relative h-[75vh] w-full flex flex-col justify-center items-center text-white text-center p-4 bg-[rgba(31,31,31,0.2)]">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
            Silver Jubilee Celebration
          </h1>
          <p className="text-lg md:text-2xl font-medium text-[#828A95]">
            25 Years of Legacy | Reunite | Relive | Rejoice
          </p>
        </div>

        {/* Poster Slideshow */}
        <div className="w-[90%] mx-auto my-12">
          <h2 className="text-3xl font-bold text-center mb-8 text-[#EE634F]">
            Announcements & Posters
          </h2>
          <Slider {...posterSettings}>
            {posterImages.map((src, idx) => (
              <div key={idx} className="px-4">
                <div className="rounded-2xl overflow-visible shadow-xl border-2 border-[#352e2e] bg-black p-0">
                  <img
                    src={src}
                    alt={`Poster ${idx + 1}`}
                    className="w-full h-[450px] object-cover rounded-xl"
                  />
                </div>
              </div>
            ))}
          </Slider>
        </div>

        {/* Marquee */}
        <div className="bg-[rgba(31,31,31,0.95)] py-2 my-7 overflow-hidden border-t-2 border-b-2 border-[#4A5568] shadow-md">
          <div className="relative w-full overflow-hidden group">
            <div className="flex animate-marquee whitespace-nowrap text-lg font-semibold text-[#E2E8F0]">
              {marqueeLinks.map((link, i) => (
                <a
                  key={`${link.href}-${i}`}
                  href={link.href}
                  className="mx-8 hover:text-[#60A5FA] hover:underline transition-colors"
                >
                  {link.text}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Jubilee Memories Carousel */}
        <div className="w-[90%] mx-auto my-14">
          <h2 className="text-3xl font-bold text-center mb-8 text-[#EE634F]">
            Memories Through the Years
          </h2>
          <Slider {...jubileeSettings}>
            {jubileeImages.map((src, idx) => (
              <div key={idx} className="px-3">
                <div className="rounded-2xl overflow-hidden shadow-lg border-2 border-[#C5D7DC] p-0.5 bg-white">
                  <img
                    src={src}
                    alt={`Memory ${idx + 1}`}
                    className="w-full h-[250px] object-cover rounded-xl"
                  />
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .animate-marquee {
          animation: marquee 15s linear infinite;
          display: flex;
        }
        .group:hover .animate-marquee {
          animation-play-state: paused;
        }
      `}</style>
    </>
  );
}

export default Home;
