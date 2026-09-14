import { useParams } from "react-router-dom";
import style from "../../style/pages/productdetal.module.css";
import { useState } from "react";

const ProductDetail = () => {
  const [currentImage, setCurrentImage] = useState("/c1.jpg");

  const productdetail = [
    {
      information: {
        id: 1,
        name: "The Blue Stripe Kurta",
        description: "this is very beautiful dress",
        is_active: true,
      },
    },
    {
      images: {
        srcs: ["/c1.jpg", "/c2.jpg", "/c3.jpg", "/c4.jpg"],
      },
    },
    {
      variants: {
        colors: ["blue", "red"],
        prices: [1000, 1500],
        stock: [10, 20],
        is_active: [true, true],
      },
    },
  ];

  return (
    <div className={style.container}>
      <div className={style.product_container}>
        <div className={style.product_image}>
          <div className={style.product_image_list}>
            {productdetail[1].images.srcs.map((src, index) => (
              <div className={style.product_image_list_item}>
                <img key={index} src={src} alt="" />
              </div>
            ))}
          </div>
          <div className={style.product_image_main}>
            <img src={currentImage} alt="" />
          </div>
        </div>
        <div className={style.product_information}>
          <p className={style.name}>{productdetail[0].information.name}</p>
          <p className={style.description}>
            {productdetail[0].information.description}
          </p>
          <p className={style.price}>
            {productdetail[2].variants.prices[0]} included all the taxes
          </p>
          <select name="" id="" className={style.selectvariants}>
            <option value="">select color</option>
            {productdetail[2].variants.colors.map((color, index) => (
              <option value={index}>{color}</option>
            ))}
          </select>
          <button className={style.addtobag}>Add to bag</button>
          <p className={style.deliveryinfo}>
            Estimated delivery <b>18 Sept - 23 Sept</b>
          </p>
          <p className={style.extraifo}>
            There will be custom sizes will take that info at the order page
          </p>
          <p className={style.extraifo}>
            Free delivery for order above ₹999 | return within 30 days
          </p>
        </div>
      </div>
      <div className={style.product_detail_container}>
        <p className={style.product_detail_title}>THE DETAILS</p>
        <div className={style.product_detail}>
          <div className={style.product_detail_left}>
            <p className={style.product_detail_title}>Highlights</p>
            <ul className={style.product_detail_list}>
              <li>black</li>
              <li>peak lapels</li>
              <li>double-breasted button fastening</li>
              <li>long sleeves</li>
              <li>FARFETCH ID: 38161343</li>
            </ul>
          </div>
          <div className={style.product_detail_right}>
            <p className={style.product_detail_title}>Composition</p>
            <p className={style.product_detail_item}>Outer: Cotton 100%</p>
            <p className={style.product_detail_item}>Lining: Polyamide 100%</p>
            <p className={style.product_detail_item}>Filling: Polyester 100%</p>
            <p className={style.product_detail_item}>Inner: Polyamide 100%</p>

            <p className={style.product_detail_title}>Washing instructions</p>
            <p className={style.product_detail_item}>Machine Wash</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
