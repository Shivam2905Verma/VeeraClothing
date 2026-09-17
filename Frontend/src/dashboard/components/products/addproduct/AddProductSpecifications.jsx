import style from "../../../style/components/addProductSpecifications.module.css";

const AddProductSpecifications = ({
  formData,
  handleInputChange,
}) => {
  return (
    <div className={style.formCard} style={{ marginTop: "24px" }}>
      <div className={style.cardHeader}>
        <div>
          <h2 className={style.cardTitle}>Product Specifications</h2>
          <p className={style.cardSubtitle}>
            Key features, fabric details, and care guide
          </p>
        </div>
      </div>

      <div className={style.grid2}>
        <div className={style.formGroup}>
          <div className={style.labelWrapper}>
            <label htmlFor="highlights" className={style.formLabel}>
              Highlights *
            </label>
            <span className={style.helperBadge}>
              separate info by comma ( , )
            </span>
          </div>
          <input
            id="highlights"
            name="highlights"
            type="text"
            required
            placeholder="e.g. Breathable cotton fabric, Button-down collar, Regular fit"
            value={formData.highlights}
            onChange={handleInputChange}
            className={style.formInput}
          />
        </div>

        <div className={style.formGroup}>
          <div className={style.labelWrapper}>
            <label htmlFor="composition" className={style.formLabel}>
              Composition *
            </label>
            <span className={style.helperBadge}>
              separate info by comma ( , )
            </span>
          </div>
          <input
            id="composition"
            name="composition"
            type="text"
            required
            placeholder="e.g. 100% Premium Cotton, 180 GSM woven fabric"
            value={formData.composition}
            onChange={handleInputChange}
            className={style.formInput}
          />
        </div>
      </div>

      <div className={style.grid2} style={{ marginTop: "8px" }}>
        <div className={style.formGroup}>
          <div className={style.labelWrapper}>
            <label htmlFor="care" className={style.formLabel}>
              Care *
            </label>
          </div>
          <input
            id="care"
            name="care"
            type="text"
            required
            placeholder="e.g. Machine wash cold with like colors, Do not bleach"
            value={formData.care}
            onChange={handleInputChange}
            className={style.formInput}
          />
        </div>

        <div className={style.formGroup}>
          <div className={style.labelWrapper}>
            <label htmlFor="extra_info" className={style.formLabel}>
              Extra Info *
            </label>
            <span className={style.helperBadge}>
              separate info by comma ( , )
            </span>
          </div>
          <input
            id="extra_info"
            name="extra_info"
            type="text"
            required
            placeholder="e.g. Model is 6ft wearing size L, Made in India"
            value={formData.extra_info}
            onChange={handleInputChange}
            className={style.formInput}
          />
        </div>
      </div>
    </div>
  );
};

export default AddProductSpecifications;
