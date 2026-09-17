import { useEffect } from "react";
import style from "../../../style/components/addProductImagesSection.module.css";

const AddProductImagesSection = ({
  images,
  setImages,
  showToast,
}) => {
  // Cleanup object URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (img && img.preview) {
          URL.revokeObjectURL(img.preview);
        }
      });
    };
  }, [images]);

  // Handle Image Upload for a specific slot
  const handleImageChange = (index, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast("Image size must be less than 5MB.", "error");
      return;
    }

    const preview = URL.createObjectURL(file);

    setImages((prev) => {
      const updated = [...prev];
      if (updated[index]?.preview) {
        URL.revokeObjectURL(updated[index].preview);
      }
      updated[index] = { file, preview };
      return updated;
    });
  };

  // Remove image from a specific slot
  const handleRemoveImage = (index, e) => {
    e.stopPropagation();
    setImages((prev) => {
      const updated = [...prev];
      if (updated[index]?.preview) {
        URL.revokeObjectURL(updated[index].preview);
      }
      updated[index] = null;
      return updated;
    });
  };

  return (
    <div className={style.formCard} style={{ marginTop: "24px" }}>
      <div className={style.cardHeader}>
        <div>
          <h2 className={style.cardTitle}>Product Images (5 Slots)</h2>
          <p className={style.cardSubtitle}>
            Attach up to 5 high-resolution images. The first box will be the
            primary cover image.
          </p>
        </div>
      </div>

      <div className={style.imageBoxesGrid}>
        {images.map((img, index) => (
          <div
            key={index}
            className={`${style.imageBox} ${
              img ? style.imageBoxFilled : ""
            }`}
          >
            {/* Slot Tag */}
            <span
              className={`${style.slotTag} ${
                index === 0 ? style.primarySlotTag : ""
              }`}
            >
              {index === 0 ? "Cover (1)" : `Image ${index + 1}`}
            </span>

            {img ? (
              <>
                <img
                  src={img.preview}
                  alt={`Slot ${index + 1} Preview`}
                  className={style.previewImg}
                />
                <button
                  type="button"
                  className={style.removeImageBtn}
                  onClick={(e) => handleRemoveImage(index, e)}
                  title="Remove image"
                >
                  <i className="ri-close-line" />
                </button>
              </>
            ) : (
              <>
                <div className={style.uploadPrompt}>
                  <div className={style.uploadIcon}>
                    <i
                      className="ri-image-add-line"
                      style={{ fontSize: "1.5rem" }}
                    />
                  </div>
                  <span className={style.uploadText}>
                    {index === 0 ? "+ Add Cover" : "+ Add Image"}
                  </span>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(index, e)}
                  className={style.hiddenFileInput}
                  title={`Upload Image ${index + 1}`}
                />
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddProductImagesSection;
