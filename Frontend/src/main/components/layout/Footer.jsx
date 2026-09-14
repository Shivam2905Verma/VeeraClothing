import style from "../../style/components/footer.module.css";

const Footer = () => {
  return (
    <div className={style.footer}>
      <div className={style.followus}>
        <p>Follow us :</p>
        <i className="ri-instagram-line"></i>
        <i className="ri-pinterest-fill"></i>
      </div>
      <div className={style.paymenttypes}>
        <p>Payment types :</p>
        <div className={style.paymentLogos}>
          <img src="/cashfree.svg" alt="cashfree" />
          <img src="/razorpay.svg" alt="cashfree" />
        </div>
      </div>
    </div>
  );
};

export default Footer;
