import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import style from "../../style/pages/home.module.css";
import Carousel from "../../components/home/Carousel";
import Card from "../../components/common/Card";
import useHorizontalScroll from "../../hooks/useHorizontalScroll";
import { brandDetail } from "../../../common/brandDetail";
import { getAllProducts } from "../../services/product.service";

const CATEGORIES = [
  { id: 1, name: "Shirts", price: "499", img: "./c1.jpg" },
  { id: 2, name: "T-Shirts", price: "399", img: "./c2.jpg" },
  { id: 3, name: "Hoodies", price: "899", img: "./c3.jpg" },
  { id: 4, name: "Trousers", price: "799", img: "./c4.jpg" },
  { id: 5, name: "Jackets", price: "1299", img: "./c1.jpg" },
];

const Home = () => {
  const categoryScrollRef = useHorizontalScroll();
  const arrivalsScrollRef = useHorizontalScroll();
  const [newArrivals, setNewArrivals] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const fetchArrivals = async () => {
      try {
        const data = await getAllProducts();
        if (isMounted && data && data.products) {
          const activeOnly = data.products.filter(
            (item) => item.is_active === true || item.is_active === 1,
          );
          setNewArrivals(activeOnly);
        }
      } catch (error) {
        console.error("Failed to fetch new arrivals:", error);
      }
    };
    fetchArrivals();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className={style.container}>
      <Carousel />

      {/* Category Section */}
      <section className={style.productSection}>
        <div className={style.sectionHeader}>
          <h2>Choose Category</h2>
        </div>
        <div ref={categoryScrollRef} className={style.cardsContainer}>
          {CATEGORIES.map((item) => (
            <Link key={item.id} to={`/shopall`} className={style.cardLink}>
              <Card img={item.img} name={item.name} price={item.price} />
            </Link>
          ))}
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className={style.productSection}>
        <div className={style.sectionHeader}>
          <h2>New Arrivals</h2>
        </div>
        <div ref={arrivalsScrollRef} className={style.cardsContainer}>
          {newArrivals.length > 0 ? (
            newArrivals.map((item) => (
              <Link
                key={item.id}
                to={`/shop/${item.id}`}
                className={style.cardLink}
              >
                <Card
                  img={item.image_url}
                  name={item.name}
                  price={item.price}
                />
              </Link>
            ))
          ) : (
            <p style={{ padding: "20px", color: "#64748b" }}>
              No active products available at the moment.
            </p>
          )}
        </div>
      </section>

      <div className={style.divider} />

      {/* Contact Section */}
      <section className={style.contactUs}>
        <h3 className={style.contactTitle}>Contact Us</h3>
        <div className={style.contactList}>
          <a
            href={`tel:${brandDetail.phone}`}
            className={`${style.contactItem}`}
          >
            <i className="ri-phone-line" />
            <span className={style.contactLabel}>Phone</span>
            <span className={style.contactValue}>{brandDetail.phone}</span>
          </a>

          <a
            href={`https://instagram.com/${brandDetail.instagram?.replace("@", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`${style.contactItem} ${style.borderMiddle}`}
          >
            <i className="ri-instagram-line" />
            <span className={style.contactLabel}>Instagram</span>
            <span className={style.contactValue}>{brandDetail.instagram}</span>
          </a>

          <a
            href={`mailto:${brandDetail.email}`}
            className={`${style.contactItem}`}
          >
            <i className="ri-mail-line" />
            <span className={style.contactLabel}>Email</span>
            <span className={style.contactValue}>{brandDetail.email}</span>
          </a>
        </div>
      </section>

      <footer className={style.footerBar}>
        <p className={style.footerText}>{brandDetail.phoneopen}</p>
      </footer>
    </div>
  );
};

export default Home;
