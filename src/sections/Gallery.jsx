
import { useState } from "react";
import { ArrowLeft, ArrowRight, Images } from "lucide-react";
import { galleryData, galleryCategories } from "../data/gallery";

const formatCategory = (category) => {
  const labels = {
    orientations: "Orientations",
    techfieesta_26: "Techfieeeesta '26",
    workshops: "Workshops",
    community: "Community & Team",
    celebrations: "Celebrations",
  };

  if (labels[category]) return labels[category];

  return category
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

export default function Gallery({
  onOpenImage,
  fullGallery = false,
  onViewAll,
  onBack,
}) {
  const [activeCategory, setActiveCategory] = useState("All");

  const images = galleryData;

const categories = ["All", ...galleryCategories];

  const visibleImages = fullGallery
    ? activeCategory === "All"
      ? images
      : images.filter((image) => image.category === activeCategory)
    : images.slice(0, 4);

  return (
    <section
      className={`gallery-section ${
        fullGallery ? "gallery-full-page" : "gallery-preview"
      }`}
      id={fullGallery ? undefined : "gallery"}
    >
      <div className="gallery-heading">
        <div>
          <p className="eyebrow">
            {fullGallery ? "EXPLORE OUR MEMORIES" : "OUR MEMORIES"}
          </p>

          <h2>
            {fullGallery ? "The IEEE Gallery" : "Life at IEEE STB"}
          </h2>

          <p>
            Explore the events, people, and experiences that make our IEEE
            Student Branch special.
          </p>
        </div>

        {fullGallery && (
          <button
            type="button"
            className="gallery-back-button"
            onClick={onBack}
          >
            <ArrowLeft size={17} />
            Back to Home
          </button>
        )}
      </div>

      {fullGallery && (
        <div
          className="gallery-filters"
          aria-label="Filter photos by event"
        >
          {categories.map((category) => (
            <button
              type="button"
              key={category}
              className={
                activeCategory === category
                  ? "gallery-filter active"
                  : "gallery-filter"
              }
              aria-pressed={activeCategory === category}
              onClick={() => setActiveCategory(category)}
            >
              {category === "All" ? "All" : formatCategory(category)}
            </button>
          ))}
        </div>
      )}

      <div className="gallery-grid">
        {visibleImages.map((image) => (
          <button
            key={image.src}
            type="button"
            className="gallery-item"
            onClick={() => onOpenImage(image)}
            aria-label={`View larger: ${image.alt}`}
          >
            <img
              src={image.src}
              alt={image.alt}
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {fullGallery && visibleImages.length === 0 && (
        <p className="gallery-empty">
          No photos have been assigned to this category yet.
        </p>
      )}

      {!fullGallery && images.length > 0 && (
        <div className="gallery-view-all">
          <button
            type="button"
            className="button primary"
            onClick={onViewAll}
          >
            <Images size={17} />
            View All Photos
            <ArrowRight size={17} />
          </button>
        </div>
      )}
    </section>
  );
}
