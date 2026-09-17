import style from "../../../style/components/addProductBasicInfo.module.css";

const AddProductBasicInfo = ({
  formData,
  handleInputChange,
  categories = [],
  categoriesLoading = false,
}) => {
  return (
    <div className={style.formCard}>
      <div className={style.cardHeader}>
        <div>
          <h2 className={style.cardTitle}>Basic Information</h2>
          <p className={style.cardSubtitle}>
            General product details and assigned category
          </p>
        </div>
      </div>

      <div className={style.grid2}>
        <div className={style.formGroup}>
          <label htmlFor="name" className={style.formLabel}>
            Product Name *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="e.g. Classic Oxford Cotton Shirt"
            value={formData.name}
            onChange={handleInputChange}
            className={style.formInput}
          />
        </div>

        <div className={style.formGroup}>
          <label htmlFor="category_id" className={style.formLabel}>
            Category *
          </label>
          <select
            id="category_id"
            name="category_id"
            required
            value={formData.category_id}
            onChange={handleInputChange}
            className={style.formSelect}
          >
            <option value="">
              {categoriesLoading
                ? "Loading categories..."
                : "-- Select Product Category --"}
            </option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={style.formGroup}>
        <label htmlFor="description" className={style.formLabel}>
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          placeholder="Provide an overview of the product style, fit, and appearance..."
          value={formData.description}
          onChange={handleInputChange}
          className={style.formTextarea}
        />
      </div>
    </div>
  );
};

export default AddProductBasicInfo;
