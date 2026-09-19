import { useState, useEffect } from "react";
import {
  getAllDashboardSpotlights,
  createSpotlight,
  updateSpotlight,
} from "../../service/spotlight.service";
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

const SpotlightCardEditor = ({
  positionLabel,
  initialData,
  defaultData,
  onSave,
  saving,
}) => {
  const [formData, setFormData] = useState({
    tag: initialData?.tag || defaultData.tag,
    title: initialData?.title || defaultData.title,
    link_url: initialData?.link_url || defaultData.link_url,
    image_url: initialData?.image_url || defaultData.image_url,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(
    initialData?.image_url || defaultData.image_url
  );

  useEffect(() => {
    if (initialData) {
      setFormData({
        tag: initialData.tag || defaultData.tag,
        title: initialData.title || defaultData.title,
        link_url: initialData.link_url || defaultData.link_url,
        image_url: initialData.image_url || defaultData.image_url,
      });
      setPreviewUrl(initialData.image_url || defaultData.image_url);
    }
  }, [initialData, defaultData]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("tag", formData.tag || "SPOTLIGHT");
    data.append("title", formData.title);
    data.append("link_url", formData.link_url || "/shopall");

    if (selectedFile) {
      data.append("image", selectedFile);
    } else if (formData.image_url) {
      data.append("image_url", formData.image_url);
    }

    onSave(initialData?.id, data);
  };

  return (
    <div className={style.spotlightCard}>
      <div className={style.cardHeader}>
        <div className={style.positionBadge}>
          <i className="ri-layout-grid-fill" />
          <span>{positionLabel}</span>
        </div>
        {initialData?.id && (
          <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
            ID: #{initialData.id}
          </span>
        )}
      </div>

      {/* Live Preview */}
      <div className={style.livePreviewWrapper}>
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={formData.title}
            className={style.previewImg}
          />
        ) : (
          <div className={style.previewEmpty}>
            <i className="ri-image-line" style={{ fontSize: "2rem" }} />
            <span>No image selected</span>
          </div>
        )}
        <div className={style.topOverlay} />
        <div className={style.bottomOverlay} />
        <span className={style.previewTag}>{formData.tag || "SPOTLIGHT"}</span>
        <div className={style.previewFooter}>
          <h3 className={style.previewTitle}>
            {formData.title || "TITLE HERE"}
          </h3>
          <span className={style.previewShopNow}>SHOP NOW</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div className={style.formGroup}>
          <label className={style.formLabel}>Card Image</label>
          <label className={style.uploadBox}>
            <i className="ri-upload-cloud-line" style={{ fontSize: "1.2rem" }} />
            <span>{selectedFile ? selectedFile.name : "Choose New Image..."}</span>
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </label>
        </div>

        <div className={style.formGroup}>
          <label className={style.formLabel}>Badge Tag</label>
          <input
            type="text"
            className={style.formInput}
            value={formData.tag}
            placeholder="e.g. SPOTLIGHT"
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, tag: e.target.value }))
            }
          />
        </div>

        <div className={style.formGroup}>
          <label className={style.formLabel}>Card Title</label>
          <input
            type="text"
            required
            className={style.formInput}
            value={formData.title}
            placeholder="e.g. OVERSIZED DROP-SHOULDER HOODIE"
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
          />
        </div>

        <div className={style.formGroup}>
          <label className={style.formLabel}>Target Link (Shop Now)</label>
          <input
            type="text"
            className={style.formInput}
            value={formData.link_url}
            placeholder="e.g. /shopall or /shop/1"
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, link_url: e.target.value }))
            }
          />
        </div>

        <button
          type="submit"
          className={style.saveBtn}
          disabled={saving}
        >
          {saving ? (
            <>
              <i className="ri-loader-4-line" style={{ animation: "spin 1s linear infinite" }} />
              Saving...
            </>
          ) : (
            <>
              <i className="ri-save-line" />
              Save {positionLabel}
            </>
          )}
        </button>
      </form>
    </div>
  );
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
