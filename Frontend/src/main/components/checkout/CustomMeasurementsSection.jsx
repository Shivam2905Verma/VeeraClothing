import { useState, useEffect } from "react";
import { getMeasurementOfCategories } from "../../services/measurement.service";
import style from "../../style/components/checkout/tailoringMeasurements.module.css";

const CustomMeasurementsSection = ({ cartList = [], onMeasurementsChange }) => {
  const [requiredMeasurementTypes, setRequiredMeasurementTypes] = useState([]);
  const [measurementsInput, setMeasurementsInput] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Fetch measurement types required for the items in cart
  useEffect(() => {
    const loadMeasurements = async () => {
      const categoryIds = [
        ...new Set(
          cartList
            .map((item) => item.categoryId || item.category_id)
            .filter(Boolean),
        ),
      ];

      if (categoryIds.length === 0) {
        setRequiredMeasurementTypes([]);
        return;
      }

      try {
        setIsLoading(true);
        const res = await getMeasurementOfCategories(categoryIds);

        if (res?.success && Array.isArray(res.measurements)) {
          setRequiredMeasurementTypes(res.measurements);
        } else {
          setRequiredMeasurementTypes([]);
        }
      } catch (error) {
        console.error("Failed to load category measurements:", error);
        setRequiredMeasurementTypes([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadMeasurements();
  }, [cartList]);


  // Handler for measurement input changes
  const handleInputChange = (measId, value) => {
    const updated = {
      ...measurementsInput,
      [measId]: value,
    };
    setMeasurementsInput(updated);
    if (onMeasurementsChange) {
      onMeasurementsChange(updated);
    }
  };

  return (
    <div className={style.sectionBlock}>
      <div className={style.sectionHeader}>
        <div className={style.sectionTitleRow}>
          <h2 className={style.sectionTitle}>Custom Tailoring Measurements</h2>
        </div>
      </div>

      {isLoading ? (
        <div className={style.noMeasurementsRequired}>
          <i
            className="ri-loader-4-line ri-spin"
            style={{ fontSize: "1.1rem" }}
          />
          <span>Checking custom tailoring requirements...</span>
        </div>
      ) : requiredMeasurementTypes.length > 0 ? (
        <div className={style.measurementsBox}>
          <p className={style.boxDescription}>
            Your cart contains items (e.g. Kurti, Suit) that offer bespoke
            tailoring. Please provide your measurements below:
          </p>

          <div className={style.measurementsGrid}>
            {requiredMeasurementTypes.map((m) => (
              <div key={m.id} className={style.inputGroup}>
                <label className={style.label}>{m.name}</label>
                <div className={style.measurementInputWrapper}>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="e.g. 38"
                    value={measurementsInput[m.id] || ""}
                    onChange={(e) => handleInputChange(m.id, e.target.value)}
                    className={style.input}
                  />
                  <span className={style.measurementUnitBadge}>
                    {m.unit || "inch"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <p className={style.measurementHelpText}>
            💡 All custom measurements will be carefully reviewed by our master
            tailors before dispatch.
          </p>
        </div>
      ) : (
        <div className={style.noMeasurementsRequired}>
          <i className="ri-information-line" style={{ fontSize: "1.1rem" }} />
          <span>
            Standard Sizing — No custom measurements required for current cart
            items.
          </span>
        </div>
      )}
    </div>
  );
};

export default CustomMeasurementsSection;
