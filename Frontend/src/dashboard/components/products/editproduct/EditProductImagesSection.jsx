import { useState, useEffect } from "react";
import {
  deleteProductImage,
  uploadProductImage,
  getProductById,
} from "../../../service/product.service";
import ConfirmModal from "../../../../common/ConfirmModal";
import style from "../../../style/components/editProductImagesSection.module.css";

const EditProductImagesSection = ({
  productId,
  images,
  setImages,
  populateImagesFromProduct,
  showToast,
}) => {
  // Image Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  // Cleanup newly created object URLs on unmount
  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (img && img.preview && !img.existing) {
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
      if (updated[index]?.preview && !updated[index]?.existing) {
        URL.revokeObjectURL(updated[index].preview);
      }
      updated[index] = { file, preview, existing: false };
      return updated;
    });
  };

  // Remove image from a specific slot
  const handleRemoveImage = (index, e) => {
    e.stopPropagation();
    const targetImage = images[index];
    if (!targetImage) return;

    if (targetImage.existing && targetImage.id) {
      setImageToDelete({
        index,
        imageId: targetImage.id,
        isCover: index === 0,
      });
      setDeleteModalOpen(true);
    } else {
      // Newly selected local file, just remove from state and revoke URL
      if (targetImage.preview && !targetImage.existing) {
        URL.revokeObjectURL(targetImage.preview);
      }
      setImages((prev) => {
        const updated = [...prev];
        updated[index] = null;
        return updated;
      });
    }
  };

  const handleConfirmDeleteImage = async () => {
    if (!imageToDelete) return;

    try {
      setIsDeletingImage(true);
      await deleteProductImage(
        productId,
        imageToDelete.imageId,
        imageToDelete.isCover,
      );

      setImages((prev) => {
        const updated = [...prev];
        updated[imageToDelete.index] = null;
        return updated;
      });

      showToast("Image deleted successfully!", "success");
      setDeleteModalOpen(false);
      setImageToDelete(null);
    } catch (error) {
      console.error("Failed to delete product image:", error);
      const msg =
        error.response?.data?.message ||
        "Failed to delete product image. Please try again.";
      showToast(msg, "error");
    } finally {
      setIsDeletingImage(false);
    }
  };

  const handleCancelDeleteImage = () => {
    if (isDeletingImage) return;
    setDeleteModalOpen(false);
    setImageToDelete(null);
  };

  // Check if any slot has a newly added local file
  const hasNewImages = images.some((img) => img && !img.existing && img.file);

  // Upload new images to backend
  const handleUploadNewImages = async () => {
    const newItems = images
      .map((img, idx) => ({ img, idx }))
      .filter(({ img }) => img && !img.existing && img.file);

    if (newItems.length === 0) {
      showToast("No new images to upload.", "error");
      return;
    }

    try {
      setIsUploadingImages(true);
      const imgFormData = new FormData();
      const isCoverArray = [];

      newItems.forEach(({ img, idx }) => {
        imgFormData.append("images", img.file);
        isCoverArray.push(idx === 0);
      });

      imgFormData.append("isCover", JSON.stringify(isCoverArray));

      await uploadProductImage(productId, imgFormData);
      showToast("New image(s) uploaded successfully!", "success");

      // Refetch product data to refresh images from database
      const prodData = await getProductById(productId);
      if (prodData?.product) {
        populateImagesFromProduct(prodData.product);
      }
    } catch (error) {
      console.error("Failed to upload new product image(s):", error);
      const msg =
        error.response?.data?.message ||
        "Failed to upload image(s). Please try again.";
      showToast(msg, "error");
    } finally {
      setIsUploadingImages(false);
    }
  };

  return (
    <>
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Product Image"
        message="Are you sure you want to delete this product image? This will permanently remove the image from Cloudinary and the database."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDeleteImage}
        onCancel={handleCancelDeleteImage}
        isDestructive={true}
        isLoading={isDeletingImage}
      />

      {/* SECTION: 5 IMAGE UPLOAD BOXES WITH PREVIEWS */}
      <div className={style.formCard} style={{ marginTop: "24px" }}>
        <div className={style.cardHeader}>
          <div>
            <h2 className={style.cardTitle}>Product Images (5 Slots)</h2>
            <p className={style.cardSubtitle}>
              Current images loaded from the database.
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

        <div className={style.uploadBottomBar}>
          <span className={style.uploadHelperText}>
            {hasNewImages
              ? "You have selected new images ready to upload."
              : "Select a new image in an available slot above to enable upload."}
          </span>
          <button
            type="button"
            onClick={handleUploadNewImages}
            disabled={!hasNewImages || isUploadingImages}
            className={style.submitBtn}
          >
            {isUploadingImages ? (
              <>
                <i
                  className="ri-loader-4-line ri-spin"
                  style={{ fontSize: "1.1rem" }}
                />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <i
                  className="ri-upload-cloud-2-line"
                  style={{ fontSize: "1.1rem" }}
                />
                <span>Upload</span>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default EditProductImagesSection;
