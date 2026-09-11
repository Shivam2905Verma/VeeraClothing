import styles from "../../style/components/card.module.css";

const Card = ({ img, name, price }) => {
  return (
    <div className={styles.card}>
      <div className={styles.cardimg}>
        <img src={img} alt="" />
      </div>
      <div className={styles.cardinfo}>
        <div className={styles.cardname}>{name}</div>
        <div className={styles.cardprice}>{price}</div>
      </div>
    </div>
  );
};

export default Card;
