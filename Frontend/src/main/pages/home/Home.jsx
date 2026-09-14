import { Link } from "react-router-dom";
import style from "../../style/pages/home.module.css";
import Carousel from "../../components/home/Carousel";
import Card from "../../components/common/Card";
import useHorizontalScroll from "../../hooks/useHorizontalScroll";
import { brandDetail } from "../../../common/brandDetail";

const Home = () => {
  const categoryScrollRef = useHorizontalScroll();
  const arrivalsScrollRef = useHorizontalScroll();

  const categories = [
    {
      id: 1,
      name: "Shirt",
      price: "499",
      img: "./c1.jpg",
    },
    {
      id: 2,
      name: "Shirt",
      price: "499",
      img: "./c2.jpg",
    },
    {
      id: 3,
      name: "Shirt",
      price: "499",
      img: "./c3.jpg",
    },
    {
      id: 4,
      name: "Shirt",
      price: "499",
      img: "./c4.jpg",
    },
    {
      id: 5,
      name: "Shirt",
      price: "499",
      img: "./c1.jpg",
    },
  ];
  const newArrivals = [
    {
      id: 1,
      name: "Shirt",
      price: "499",
      img: "./c1.jpg",
    },
    {
      id: 2,
      name: "Shirt",
      price: "499",
      img: "./c2.jpg",
    },
    {
      id: 3,
      name: "Shirt",
      price: "499",
      img: "./c3.jpg",
    },
    {
      id: 4,
      name: "Shirt",
      price: "499",
      img: "./c4.jpg",
    },
    {
      id: 5,
      name: "Shirt",
      price: "499",
      img: "./c1.jpg",
    },
  ];

  return (
    <div className={style.container}>
      <Carousel />
      <div className={style.section}>Choose category</div>
      <div ref={categoryScrollRef} className={style.cardscontainer}>
        {categories.map((item) => (
          <Link key={item.id} to={`category/${item.id}`}>
            <Card img={item.img} name={item.name} price={item.price} />
          </Link>
        ))}
      </div>

      <div className={style.section}>New Arrivals</div>
      <div ref={arrivalsScrollRef} className={style.cardscontainer}>
        {newArrivals.map((item) => (
          <Link key={item.id} to={`shop/${item.id}`}>
            <Card img={item.img} name={item.name} price={item.price} />
          </Link>
        ))}
      </div>

      <div className="divider"></div>

      <div className={style.contactus}>
        <h3 className={style.contactustitle}>Contact Us</h3>
        <div className={style.contactlist}>
          <div className={style.mobile + " " + style.contactway}>
            <p>Phone</p> <i className="ri-phone-line"></i>
            <p>{brandDetail.phone}</p>
          </div>
          <div className={style.instagram + " " + style.contactway}>
            <p>Instagram</p> <i className="ri-instagram-line"></i>
            <p>{brandDetail.instagram}</p>
          </div>
          <div className={style.email + " " + style.contactway}>
            <p>Email</p>
            <i className="ri-mail-line"></i>
            <p>{brandDetail.email}</p>
          </div>
        </div>
      </div>

      <div className={style.section}>
        <p className={style.text}>{brandDetail.phoneopen}</p>
      </div>
    </div>
  );
};

export default Home;
