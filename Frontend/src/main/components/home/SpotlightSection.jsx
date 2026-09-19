import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getSpotlights } from "../../services/spotlight.service";
import style from "../../style/components/spotlightSection.module.css";

const DEFAULT_SPOTLIGHTS = [
  {
    id: 1,
    tag: "SPOTLIGHT",
    title: "OVERSIZED DROP-SHOULDER HOODIE",
    image_url: "/c3.jpg",
    link_url: "/shopall",
  },
  {
    id: 2,
    tag: "SPOTLIGHT",
    title: "VINTAGE WASHED GRAPHIC TEE",
    image_url: "/c2.jpg",
    link_url: "/shopall",
  },
];

const SpotlightSection = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadSpotlights = async () => {
      try {
        const res = await getSpotlights();
        if (isMounted) {
          if (res?.spotlights && res.spotlights.length > 0) {
            setItems(res.spotlights);
          } else {
            setItems(DEFAULT_SPOTLIGHTS);
          }
        }
      } catch (err) {
        console.error("Error loading spotlights:", err);
        if (isMounted) {
          setItems(DEFAULT_SPOTLIGHTS);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadSpotlights();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading && items.length === 0) {
    return null;
  }

  // First card on the left, second card on the right
  const displayItems = items.length >= 2 ? items.slice(0, 2) : (items.length === 1 ? [items[0], DEFAULT_SPOTLIGHTS[1]] : DEFAULT_SPOTLIGHTS);

  return (
    <section className={style.spotlightSection} aria-label="Spotlight Collections">
      <div className={style.cardsGrid}>
        {displayItems.map((item, idx) => (
          <Link
            key={item.id || idx}
            to={item.link_url || "/shopall"}
            className={style.cardLink}
          >
            <div className={style.imageWrapper}>
              <img
                src={item.image_url}
                alt={item.title || "Spotlight product"}
                className={style.spotlightImg}
                loading="lazy"
              />
              <div className={style.topOverlay} />
              <div className={style.bottomOverlay} />
              <span className={style.tagBadge}>{item.tag || "SPOTLIGHT"}</span>
              <div className={style.cardFooter}>
                <h3 className={style.cardTitle}>{item.title}</h3>
                <span className={style.shopNowText}>SHOP NOW</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default SpotlightSection;
