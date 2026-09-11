import { useEffect, useRef } from "react";

function useHorizontalScroll() {
  const elRef = useRef(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    const handleMouseDown = (e) => {
      isDown = true;
      el.style.cursor = "grabbing";
      el.style.userSelect = "none"; // prevents selecting text/images while dragging
      startX = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
    };

    const handleMouseLeave = () => {
      isDown = false;
      el.style.cursor = "grab";
      el.style.removeProperty("user-select");
    };

    const handleMouseUp = () => {
      isDown = false;
      el.style.cursor = "grab";
      el.style.removeProperty("user-select");
    };

    const handleMouseMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 1; // multiplier controls drag speed
      el.scrollLeft = scrollLeft - walk;
    };

    // Attach listeners
    el.addEventListener("mousedown", handleMouseDown);
    el.addEventListener("mouseleave", handleMouseLeave);
    el.addEventListener("mouseup", handleMouseUp);
    el.addEventListener("mousemove", handleMouseMove);

    return () => {
      el.removeEventListener("mousedown", handleMouseDown);
      el.removeEventListener("mouseleave", handleMouseLeave);
      el.removeEventListener("mouseup", handleMouseUp);
      el.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return elRef;
}
export default useHorizontalScroll;
