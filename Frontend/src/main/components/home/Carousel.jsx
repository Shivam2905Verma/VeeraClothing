import { useState, useRef } from "react";
import style from "../../style/components/carousel.module.css";

const IMAGES = ["/i1.jpg", "/i2.jpg", "/i3.jpg", "/i4.jpg"];

const Carousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const startXRef = useRef(0);
  const containerRef = useRef(null);

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

    if (dragOffset < -threshold && currentIndex < IMAGES.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else if (dragOffset > threshold && currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
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
    </div>
  );
};

export default Carousel;
