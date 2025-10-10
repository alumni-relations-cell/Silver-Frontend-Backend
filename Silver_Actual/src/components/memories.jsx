import { useState, useEffect } from "react";
import Masonry from "react-masonry-css";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const PhotoGallery = () => {
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
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
  const closeLightbox = () => setSelectedPhoto(null);
  const goToPrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : photos.length - 1;
    setCurrentIndex(newIndex);
    setSelectedPhoto(photos[newIndex]);
  };
  const goToNext = () => {
    const newIndex = currentIndex < photos.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(newIndex);
    setSelectedPhoto(photos[newIndex]);
  };

  // Masonry breakpoints (always grid, adjust columns)
  const breakpointColumnsObj = {
    default: 5,  // large screens
    1280: 4,     // laptops
    1024: 3,     // tablets
    640: 2,      // small tablets / large phones
    0: 1.5,      // phones (2 items visible with stagger)
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
            key={photo._id}
            className="mb-4 overflow-hidden rounded-lg shadow-lg cursor-pointer transform transition-transform duration-300 hover:scale-105"
            onClick={() => openLightbox(photo, index)}
          >
            <img
              src={photo.url}
              alt="gallery"
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
          <button
            onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white bg-black/70 hover:bg-black/90 p-3 rounded-full z-20"
          >
            <X className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 text-white bg-black/70 hover:bg-black/90 p-2 sm:p-3 rounded-full z-20"
          >
            <ChevronLeft className="w-6 h-6 sm:w-10 sm:h-10" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); goToNext(); }}
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 text-white bg-black/70 hover:bg-black/90 p-2 sm:p-3 rounded-full z-20"
          >
            <ChevronRight className="w-6 h-6 sm:w-10 sm:h-10" />
          </button>

          <div className="max-w-7xl w-full h-full flex items-center justify-center pointer-events-none">
            <img
              src={selectedPhoto.url}
              alt="gallery"
              className="max-w-full max-h-[90vh] object-contain pointer-events-none rounded-lg"
            />
          </div>

          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded-full">
            {currentIndex + 1} / {photos.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;
