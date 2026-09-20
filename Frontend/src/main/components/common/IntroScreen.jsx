import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import style from "../../style/components/introScreen.module.css";

const IntroScreen = ({ onFinish }) => {
  const [isVisible, setIsVisible] = useState(() => {
    try {
      return !sessionStorage.getItem("veera_intro_shown");
    } catch {
      return false;
    }
  });
  const shutterRef = useRef(null);
  const contentRef = useRef(null);
  const subtitleRef = useRef(null);
  const titleRef = useRef(null);
  const lineRef = useRef(null);

  useEffect(() => {
    if (!isVisible) {
      if (onFinish) onFinish();
      return;
    }

    try {
      sessionStorage.setItem("veera_intro_shown", "true");
    } catch (e) {
      console.error(e);
    }

    // Prevent background scrolling while intro is running
    document.body.style.overflow = "hidden";

    const ctx = gsap.context(() => {
      const chars = contentRef.current.querySelectorAll(`.${style.char}`);
      const line = lineRef.current;

      const tl = gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = "";
          setIsVisible(false);
          if (onFinish) onFinish();
        },
      });

      // 1. Staggered reveal of characters from bottom
      tl.to(chars, {
        y: "0%",
        opacity: 1,
        duration: 0.7,
        stagger: 0.03,
        ease: "power4.out",
      })
        // 2. Expand luxury divider line
        .to(
          line,
          {
            width: "100px",
            duration: 0.6,
            ease: "power2.out",
          },
          "-=0.35",
        )
        // 3. Short hold so user can read
        .to({}, { duration: 0.6 })
        // 4. Words get small (shrink down & fade back into distance)
        .to(contentRef.current, {
          scale: 0.45,
          opacity: 0,
          duration: 0.65,
          ease: "power3.in",
        })
        // 5. Shutter starts sliding up during the text shrinking
        .to(
          shutterRef.current,
          {
            yPercent: -100,
            duration: 0.95,
            ease: "power4.inOut",
          },
          "-=0.2", // Overlaps seamlessly with the text shrinking
        );
    }, shutterRef);

    return () => {
      document.body.style.overflow = "";
      ctx.revert();
    };
  }, [onFinish]);

  if (!isVisible) return null;

  // Helper to split string into individual animated characters wrapped in words
  const renderSplitText = (text) => {
    const words = text.split(" ");
    return words.map((word, wordIndex) => (
      <span key={wordIndex} className={style.word}>
        {word.split("").map((char, charIndex) => (
          <span key={charIndex} className={style.char}>
            {char}
          </span>
        ))}
        {wordIndex < words.length - 1 && <span>&nbsp;</span>}
      </span>
    ));
  };

  return (
    <div ref={shutterRef} className={style.introOverlay}>
      <div ref={contentRef} className={style.introContent}>
        <div ref={subtitleRef} className={style.welcomeSubtitle}>
          {renderSplitText("Welcome to")}
        </div>
        <h1 ref={titleRef} className={style.brandTitle}>
          {renderSplitText("Veera Clothing")}
        </h1>
        <div ref={lineRef} className={style.dividerLine}></div>
      </div>
    </div>
  );
};

export default IntroScreen;
