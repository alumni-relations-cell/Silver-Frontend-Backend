import { useState, useEffect, useCallback } from "react";
import Masonry from "react-masonry-css";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const PhotoGallery = () => {
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false); // Prevent overlap clicks
  const token = localStorage.getItem("adminToken");

  // Shuffle helper
  const shuffleArray = (arr) => {
    const array = [...arr];
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  // Fetch photos from backend
  useEffect(() => {
    fetch("http://localhost:5000/api/admin/images?category=memories_page", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((data) => setPhotos(shuffleArray(data)))
      .catch((err) => console.error(err));
  }, [token]);

  const openLightbox = (photo, index) => {
    setSelectedPhoto(photo);
    setCurrentIndex(index);
  };

  const closeLightbox = () => {
    setSelectedPhoto(null);
    setIsNavigating(false);
  };

  const goToPrevious = useCallback(() => {
    if (isNavigating || photos.length === 0) return;
    setIsNavigating(true);
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex === 0 ? photos.length - 1 : prevIndex - 1;
      setSelectedPhoto(photos[newIndex]);
      return newIndex;
    });
    setTimeout(() => setIsNavigating(false), 150); // debounce navigation
  }, [isNavigating, photos]);

  const goToNext = useCallback(() => {
    if (isNavigating || photos.length === 0) return;
    setIsNavigating(true);
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex === photos.length - 1 ? 0 : prevIndex + 1;
      setSelectedPhoto(photos[newIndex]);
      return newIndex;
    });
    setTimeout(() => setIsNavigating(false), 150); // debounce navigation
  }, [isNavigating, photos]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedPhoto) return;
      if (e.key === "ArrowLeft") goToPrevious();
      if (e.key === "ArrowRight") goToNext();
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPhoto, goToPrevious, goToNext]);

  // Swipe support (mobile)
  useEffect(() => {
    let startX = 0;
    const handleTouchStart = (e) => {
      startX = e.touches[0].clientX;
    };
    const handleTouchEnd = (e) => {
      if (!startX || !selectedPhoto) return;
      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? goToNext() : goToPrevious();
      }
      startX = 0;
    };
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [selectedPhoto, goToNext, goToPrevious]);

  const breakpointColumnsObj = {
    default: 5,
    1280: 4,
    1024: 3,
    640: 2,
    0: 1,
  };

  return (
    <div className="p-4">
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="flex -ml-4 w-auto"
        columnClassName="pl-4 bg-clip-padding"
      >
        {photos.map((photo, index) => (
          <div
            key={photo._id || index}
            className="mb-4 overflow-hidden rounded-lg shadow-lg cursor-pointer transform transition-transform duration-300 hover:scale-105"
            onClick={() => openLightbox(photo, index)}
          >
            <img
              src={photo.url}
              alt={`gallery-${index}`}
              className="w-full h-auto object-cover rounded-lg"
            />
          </div>
        ))}
      </Masonry>

      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeLightbox();
            }}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white bg-black/70 hover:bg-black/90 p-3 rounded-full z-20"
          >
            <X className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>

          {/* Prev button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 text-white bg-black/70 hover:bg-black/90 p-2 sm:p-3 rounded-full z-20"
          >
            <ChevronLeft className="w-6 h-6 sm:w-10 sm:h-10" />
          </button>

          {/* Next button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 text-white bg-black/70 hover:bg-black/90 p-2 sm:p-3 rounded-full z-20"
          >
            <ChevronRight className="w-6 h-6 sm:w-10 sm:h-10" />
          </button>

          {/* Image */}
          <div className="max-w-7xl w-full h-full flex items-center justify-center pointer-events-none">
            <img
              src={selectedPhoto.url}
              alt="gallery"
              className="max-w-full max-h-[90vh] object-contain pointer-events-none rounded-lg transition-all duration-200"
            />
          </div>

          {/* Counter */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded-full">
            {currentIndex + 1} / {photos.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;
