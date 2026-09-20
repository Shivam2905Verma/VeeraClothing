import { useState, useEffect } from "react";
import style from "../../style/page/spotlight.module.css";

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
    initialData?.image_url || defaultData.image_url,
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
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "16px" }}
      >
        <div className={style.formGroup}>
          <label className={style.formLabel}>Card Image</label>
          <label className={style.uploadBox}>
            <i
              className="ri-upload-cloud-line"
              style={{ fontSize: "1.2rem" }}
            />
            <span>
              {selectedFile ? selectedFile.name : "Choose New Image..."}
            </span>
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

        <button type="submit" className={style.saveBtn} disabled={saving}>
          {saving ? (
            <>
              <i
                className="ri-loader-4-line"
                style={{ animation: "spin 1s linear infinite" }}
              />
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

export default SpotlightCardEditor;
