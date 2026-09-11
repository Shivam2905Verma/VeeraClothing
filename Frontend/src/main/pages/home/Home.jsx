import style from "../../style/pages/home.module.css";
import Carousel from "../../components/home/Carousel";
import Card from "../../components/common/Card";
import useHorizontalScroll from "../../hooks/useHorizontalScroll";

const Home = () => {
  const categoryScrollRef = useHorizontalScroll();
  const arrivalsScrollRef = useHorizontalScroll();

  return (
    <div className={style.container}>
      <Carousel />
      <div className={style.section}>Choose category</div>
      <div ref={categoryScrollRef} className={style.cardscontainer}>
        <Card img="./c1.jpg" name="Shirt" price="499" />
        <Card img="./c2.jpg" name="Shirt" price="499" />
        <Card img="./c3.jpg" name="Shirt" price="499" />
        <Card img="./c4.jpg" name="Shirt" price="499" />
        <Card img="./c1.jpg" name="Shirt" price="499" />
      </div>

      <div className={style.section}>New Arrivals</div>
      <div ref={arrivalsScrollRef} className={style.cardscontainer}>
        <Card img="./c1.jpg" name="Shirt" price="499" />
        <Card img="./c2.jpg" name="Shirt" price="499" />
        <Card img="./c3.jpg" name="Shirt" price="499" />
        <Card img="./c4.jpg" name="Shirt" price="499" />
        <Card img="./c1.jpg" name="Shirt" price="499" />
      </div>

      <div className="divider"></div>

      <div className={style.contactus}>
        <h3 className={style.contactustitle}>Contact Us</h3>
        <div className={style.contactlist}>
          <div className={style.mobile + " " + style.contactway}>
            <p>Phone</p> <i class="ri-phone-line"></i>
            <p>9692738045</p>
          </div>
          <div className={style.instagram + " " + style.contactway}>
            <p>Instagram</p> <i class="ri-instagram-line"></i>
            <p>@veera_clothing</p>
          </div>
          <div className={style.email + " " + style.contactway}>
            <p>Email</p>
            <i class="ri-mail-line"></i>
            <p>veeraclothing@gmail.com</p>
          </div>
        </div>
      </div>

      <div className={style.section}>
        <p className={style.text}>
          Phone : Available Monday to Saturday, 9:30 am - 7:30 pm
        </p>
      </div>
    </div>
  );
};

export default Home;
