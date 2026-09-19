import { useState, useRef, useEffect, useCallback } from "react";
import style from "../../style/components/carousel.module.css";

const IMAGES = ["/i1.webp", "/i2.webp", "/i3.webp", "/i4.webp"];
const AUTO_SLIDE_INTERVAL = 2000;

const Carousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const startXRef = useRef(0);
  const containerRef = useRef(null);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % IMAGES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + IMAGES.length) % IMAGES.length);
  }, []);

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setDragOffset(0);
  };

  // Auto slide timer (pauses while dragging)
  useEffect(() => {
    if (isDragging) return;

    const timer = setInterval(() => {
      nextSlide();
    }, AUTO_SLIDE_INTERVAL);

    return () => clearInterval(timer);
  }, [isDragging, nextSlide, currentIndex]);

  // Helper to safely get touch or mouse X coordinate
  const getPositionX = (e) => {
    return e.type.includes("touch") ? e.touches[0].clientX : e.clientX;
  };

  const handleDragStart = (e) => {
    setIsDragging(true);
    startXRef.current = getPositionX(e);
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    const currentX = getPositionX(e);
    const diff = currentX - startXRef.current;
    setDragOffset(diff);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = (containerRef.current?.clientWidth || 300) * 0.2; // 20% swipe threshold

    if (dragOffset < -threshold) {
      nextSlide();
    } else if (dragOffset > threshold) {
      prevSlide();
    }

    setDragOffset(0);
  };

  return (
    <div className={style.container}>
      <div
        ref={containerRef}
        className={style.sliderWrapper}
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        <div
          className={`${style.track} ${isDragging ? style.isDragging : ""}`}
          style={{
            transform: `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))`,
          }}
        >
          {IMAGES.map((src, index) => (
            <div key={index} className={style.slide}>
              <img src={src} alt={`Slide ${index + 1}`} draggable="false" />
            </div>
          ))}
        </div>
      </div>

      {/* Indicator dots */}
      <div className={style.dotsContainer}>
        {IMAGES.map((_, index) => (
          <button
            key={index}
            type="button"
            className={`${style.dot} ${
              index === currentIndex ? style.activeDot : ""
            }`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
