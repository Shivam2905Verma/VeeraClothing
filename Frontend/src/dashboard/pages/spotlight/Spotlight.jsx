import { useState, useEffect } from "react";
import {
  getAllDashboardSpotlights,
  createSpotlight,
  updateSpotlight,
} from "../../service/spotlight.service";
import SpotlightCardEditor from "../../components/spotlight/SpotlightCardEditor";
import Toast from "../../../common/Toast";
import style from "../../style/page/spotlight.module.css";

const DEFAULT_CARD_1 = {
  tag: "SPOTLIGHT",
  title: "OVERSIZED DROP-SHOULDER HOODIE",
  link_url: "/shopall",
  image_url: "/c3.jpg",
};

const DEFAULT_CARD_2 = {
  tag: "SPOTLIGHT",
  title: "VINTAGE WASHED GRAPHIC TEE",
  link_url: "/shopall",
  image_url: "/c2.jpg",
};

const Spotlight = () => {
  const [spotlights, setSpotlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingCard1, setSavingCard1] = useState(false);
  const [savingCard2, setSavingCard2] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "error" });

  const showToast = (message, type = "error") => {
    setToast({ message, type });
  };

  const fetchSpotlights = async () => {
    try {
      setLoading(true);
      const res = await getAllDashboardSpotlights();
      if (res?.spotlights) {
        setSpotlights(res.spotlights);
      }
    } catch (err) {
      console.error("Failed to fetch spotlights:", err);
      showToast("Failed to fetch spotlights from server.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpotlights();
  }, []);

  const handleSaveCard = async (positionIndex, id, formData) => {
    const setSaving = positionIndex === 0 ? setSavingCard1 : setSavingCard2;
    try {
      setSaving(true);
      if (id) {
        await updateSpotlight(id, formData);
        showToast(`Spotlight Card #${positionIndex + 1} updated successfully!`, "success");
      } else {
        await createSpotlight(formData);
        showToast(`Spotlight Card #${positionIndex + 1} created successfully!`, "success");
      }
      await fetchSpotlights();
    } catch (err) {
      console.error("Failed to save spotlight:", err);
      showToast(
        err?.response?.data?.message || "Failed to save spotlight card.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const card1Data = spotlights[0] || null;
  const card2Data = spotlights[1] || null;

  return (
    <div className={style.container}>
      <div className={style.headerBar}>
        <div>
          <h1 className={style.headerTitle}>Spotlight Banners</h1>
          <p className={style.headerSubtitle}>
            Configure the 2 side-by-side spotlight cards on the homepage (First card = Left, Second card = Right)
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
          <i className="ri-loader-4-line" style={{ fontSize: "1.5rem" }} />
          <p style={{ marginTop: "8px" }}>Loading spotlights...</p>
        </div>
      ) : (
        <div className={style.grid}>
          <SpotlightCardEditor
            positionLabel="Left Spotlight (Card #1)"
            initialData={card1Data}
            defaultData={DEFAULT_CARD_1}
            saving={savingCard1}
            onSave={(id, data) => handleSaveCard(0, id, data)}
          />
          <SpotlightCardEditor
            positionLabel="Right Spotlight (Card #2)"
            initialData={card2Data}
            defaultData={DEFAULT_CARD_2}
            saving={savingCard2}
            onSave={(id, data) => handleSaveCard(1, id, data)}
          />
        </div>
      )}

      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: "", type: "error" })}
        />
      )}
    </div>
  );
};

export default Spotlight;
