import { useState, useEffect } from "react";
import style from "../../style/components/checkout/deliveryAddress.module.css";
import ConfirmModal from "../../../common/ConfirmModal";
import {
  getUserAddresses,
  saveUserAddress,
  updateUserAddress,
  deleteUserAddress,
} from "../../services/address.service";

const initialFormState = {
  firstname: "",
  lastname: "",
  country: "India (INR ₹)",
  address_line_1: "",
  landmark: "",
  city: "",
  state: "",
  zip_code: "",
  phone: "",
};

const DeliveryAddressSection = ({
  showToast,
  selectedAddress,
  onSelectAddress,
}) => {
  const [addresses, setAddresses] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // 'list' | 'form'
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState(initialFormState);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Delete modal state
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Fetch saved user addresses on mount
  useEffect(() => {
    const fetchSavedAddresses = async () => {
      try {
        setIsLoading(true);
        const res = await getUserAddresses();
        const addressList = res?.addresses || [];
        setAddresses(addressList);

        if (addressList.length > 0) {
          const defaultAddr = addressList[0];
          setSelectedId(defaultAddr.id);
          onSelectAddress?.(defaultAddr);
          setViewMode("list");
        } else {
          setViewMode("form");
        }
      } catch (error) {
        showToast?.(
          error?.response?.data?.message || "Failed to fetch addresses",
          "error",
        );
        setViewMode("form");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedAddresses();
  }, []);

  // Sync selectedId with selectedAddress prop if provided externally
  useEffect(() => {
    if (selectedAddress?.id) {
      setSelectedId(selectedAddress.id);
    }
  }, [selectedAddress]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectCard = (addr) => {
    setSelectedId(addr.id);
    onSelectAddress?.(addr);
  };

  const handleAddNewClick = () => {
    setEditingAddressId(null);
    setAddressForm(initialFormState);
    setViewMode("form");
  };

  const handleEditClick = (e, addr) => {
    e.stopPropagation();
    setEditingAddressId(addr.id);
    setAddressForm({
      firstname: addr.firstname || "",
      lastname: addr.lastname || "",
      country: addr.country || "India (INR ₹)",
      address_line_1: addr.address_line_1 || "",
      landmark: addr.landmark || "",
      city: addr.city || "",
      state: addr.state || "",
      zip_code: addr.zip_code || "",
      phone: addr.phone || "",
    });
    setViewMode("form");
  };

  // Open confirmation modal
  const handleDeleteClick = (e, addr) => {
    e.stopPropagation();
    setAddressToDelete(addr);
    setIsDeleteModalOpen(true);
  };

  // Execute deletion upon modal confirm
  const handleConfirmDelete = async () => {
    if (!addressToDelete) return;
    const addrId = addressToDelete.id;

    try {
      setIsSubmitting(true);
      const res = await deleteUserAddress(addrId);
      if (res?.success) {
        showToast?.("Address deleted successfully", "success");
        const remaining = addresses.filter((a) => a.id !== addrId);
        setAddresses(remaining);

        if (selectedId === addrId) {
          if (remaining.length > 0) {
            setSelectedId(remaining[0].id);
            onSelectAddress?.(remaining[0]);
          } else {
            setSelectedId(null);
            onSelectAddress?.(null);
            setIsConfirmed(false);
            setViewMode("form");
          }
        }
        setIsDeleteModalOpen(false);
        setAddressToDelete(null);
      }
    } catch (error) {
      showToast?.(
        error?.response?.data?.message || "Failed to delete address",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelForm = () => {
    if (addresses.length > 0) {
      setViewMode("list");
      setEditingAddressId(null);
      setAddressForm(initialFormState);
    }
  };

  const handleConfirmSelectedFromList = () => {
    const chosen = addresses.find((a) => a.id === selectedId);
    if (!chosen) {
      showToast?.("Please select an address first", "error");
      return;
    }
    onSelectAddress?.(chosen);
    setIsConfirmed(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (addressForm.zip_code.trim().length !== 6) {
      showToast?.("Please enter a valid 6-digit postal code.", "error");
      return;
    }

    if (addressForm.phone.trim().length < 10) {
      showToast?.("Please enter a valid 10-digit phone number.", "error");
      return;
    }

    try {
      setIsSubmitting(true);

      if (editingAddressId) {
        // Update existing address
        const res = await updateUserAddress(editingAddressId, addressForm);
        if (res?.success) {
          showToast?.("Address updated successfully!", "success");
          const updatedAddr = res.address || {
            ...addressForm,
            id: editingAddressId,
          };

          const updatedList = addresses.map((a) =>
            a.id === editingAddressId ? updatedAddr : a,
          );
          setAddresses(updatedList);
          setSelectedId(editingAddressId);
          onSelectAddress?.(updatedAddr);
          setIsConfirmed(true);
          setViewMode("list");
          setEditingAddressId(null);
        }
      } else {
        // Save new address
        const res = await saveUserAddress(addressForm);
        if (res?.success) {
          showToast?.("Address saved successfully!", "success");
          const newAddr = res.address || {
            ...addressForm,
            id: res.addressId,
          };

          const updatedList = [newAddr, ...addresses];
          setAddresses(updatedList);
          setSelectedId(newAddr.id);
          onSelectAddress?.(newAddr);
          setIsConfirmed(true);
          setViewMode("list");
        }
      }
    } catch (error) {
      showToast?.(
        error?.response?.data?.message || "Failed to save address",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeConfirmedAddress =
    addresses.find((a) => a.id === selectedId) || selectedAddress;

  return (
    <div className={style.sectionBlock}>
      {/* Delete Address Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Delivery Address"
        message={
          addressToDelete
            ? `Are you sure you want to delete the address for ${addressToDelete.firstname} ${addressToDelete.lastname} (${addressToDelete.address_line_1}, ${addressToDelete.city})?`
            : "Are you sure you want to delete this delivery address?"
        }
        confirmText="Delete Address"
        cancelText="Keep Address"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!isSubmitting) {
            setIsDeleteModalOpen(false);
            setAddressToDelete(null);
          }
        }}
        isDestructive={true}
        isLoading={isSubmitting}
      />

      <div className={style.sectionHeader}>
        <div className={style.sectionTitleRow}>
          {isConfirmed && (
            <div className={style.statusCheckIcon}>
              <i className="ri-check-line" />
            </div>
          )}
          <div>
            <h2 className={style.sectionTitle}>Delivery Address</h2>
            {!isConfirmed && (
              <p className={style.sectionSubtitle}>
                {viewMode === "list"
                  ? "Select a saved address or add a new delivery location."
                  : editingAddressId
                    ? "Update your delivery address details."
                    : "Add your primary delivery address for shipment."}
              </p>
            )}
          </div>
        </div>

        {isConfirmed && (
          <button
            type="button"
            className={style.editActionBtn}
            onClick={() => setIsConfirmed(false)}
          >
            Change
          </button>
        )}
      </div>

      {isLoading ? (
        <div className={style.loadingBox}>
          <div className={style.loadingSpinner} />
          <span>Loading saved addresses...</span>
        </div>
      ) : isConfirmed && activeConfirmedAddress ? (
        /* Confirmed Address Summary Card */
        <div className={style.confirmedCard}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: "0.95rem" }}>
            {activeConfirmedAddress.firstname} {activeConfirmedAddress.lastname}
          </p>
          <p className={style.cardAddressText}>
            {activeConfirmedAddress.address_line_1}
            {activeConfirmedAddress.landmark
              ? `, ${activeConfirmedAddress.landmark}`
              : ""}
          </p>
          <p className={style.cardAddressText}>
            {activeConfirmedAddress.city}, {activeConfirmedAddress.state} -{" "}
            {activeConfirmedAddress.zip_code}
          </p>
          <p className={style.cardPhoneText}>
            Phone: {activeConfirmedAddress.phone}
          </p>
        </div>
      ) : viewMode === "list" ? (
        /* Saved Addresses Selection List */
        <div>
          <div className={style.addressList}>
            {addresses.map((addr) => {
              const isSelected = selectedId === addr.id;

              return (
                <div
                  key={addr.id}
                  className={`${style.addressCard} ${isSelected ? style.selectedCard : ""}`}
                  onClick={() => handleSelectCard(addr)}
                >
                  <div className={style.cardTopRow}>
                    <div className={style.cardSelectArea}>
                      <div
                        className={`${style.customRadio} ${isSelected ? style.customRadioSelected : ""}`}
                      >
                        {isSelected && (
                          <div className={style.customRadioInner} />
                        )}
                      </div>
                      <div className={style.cardDetails}>
                        <div className={style.cardHeaderName}>
                          <span>
                            {addr.firstname} {addr.lastname}
                          </span>
                        </div>
                        <div className={style.cardAddressText}>
                          {addr.address_line_1}
                          {addr.landmark ? `, ${addr.landmark}` : ""}
                        </div>
                        <div className={style.cardAddressText}>
                          {addr.city}, {addr.state} - {addr.zip_code}
                        </div>
                        <div className={style.cardPhoneText}>
                          Phone: {addr.phone}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className={style.cardActions}>
                    <button
                      type="button"
                      className={style.cardActionBtn}
                      onClick={(e) => handleEditClick(e, addr)}
                    >
                      <i className="ri-edit-line" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      className={`${style.cardActionBtn} ${style.deleteActionBtn}`}
                      onClick={(e) => handleDeleteClick(e, addr)}
                      disabled={isSubmitting}
                    >
                      <i className="ri-delete-bin-line" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className={style.listBottomActions}>
            <button
              type="button"
              className={style.addNewAddressBtn}
              onClick={handleAddNewClick}
            >
              <i className="ri-add-line" />
              <span>Add New Address</span>
            </button>

            {addresses.length > 0 && (
              <button
                type="button"
                className={style.confirmBtn}
                onClick={handleConfirmSelectedFromList}
              >
                Deliver to this Address
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Add / Edit Address Form */
        <form onSubmit={handleFormSubmit} className={style.formGrid}>
          {editingAddressId && (
            <div className={style.formHeader}>Edit Address</div>
          )}

          {/* Name Row */}
          <div className={style.row2}>
            <div className={style.inputGroup}>
              <label className={style.label}>
                First name <span className={style.requiredStar}>*</span>
              </label>
              <input
                type="text"
                name="firstname"
                value={addressForm.firstname}
                onChange={handleInputChange}
                className={style.input}
                required
              />
            </div>

            <div className={style.inputGroup}>
              <label className={style.label}>
                Last name <span className={style.requiredStar}>*</span>
              </label>
              <input
                type="text"
                name="lastname"
                value={addressForm.lastname}
                onChange={handleInputChange}
                className={style.input}
                required
              />
            </div>
          </div>

          {/* Country / Region */}
          <div className={style.inputGroup}>
            <label className={style.label}>
              Country/region <span className={style.requiredStar}>*</span>
            </label>
            <input
              type="text"
              name="country"
              value={addressForm.country}
              readOnly
              className={style.input}
              style={{ backgroundColor: "#fafafa" }}
            />
          </div>

          {/* Address Line 1 */}
          <div className={style.inputGroup}>
            <label className={style.label}>
              Address <span className={style.requiredStar}>*</span>
            </label>
            <input
              type="text"
              name="address_line_1"
              placeholder="Flat / House No. / Building / Street"
              value={addressForm.address_line_1}
              onChange={handleInputChange}
              className={style.input}
              required
            />
          </div>

          {/* Landmark (Optional) */}
          <div className={style.inputGroup}>
            <label className={style.label}>
              Landmark <span style={{ color: "#888", fontWeight: 400 }}>(Optional)</span>
            </label>
            <input
              type="text"
              name="landmark"
              placeholder="Nearby landmark or area"
              value={addressForm.landmark}
              onChange={handleInputChange}
              className={style.input}
            />
          </div>

          {/* City, State, Zip Row */}
          <div className={style.row3}>
            <div className={style.inputGroup}>
              <label className={style.label}>
                City <span className={style.requiredStar}>*</span>
              </label>
              <input
                type="text"
                name="city"
                value={addressForm.city}
                onChange={handleInputChange}
                className={style.input}
                required
              />
            </div>

            <div className={style.inputGroup}>
              <label className={style.label}>
                State / County <span className={style.requiredStar}>*</span>
              </label>
              <input
                type="text"
                name="state"
                value={addressForm.state}
                onChange={handleInputChange}
                className={style.input}
                required
              />
            </div>

            <div className={style.inputGroup}>
              <label className={style.label}>
                Postal or zip code <span className={style.requiredStar}>*</span>
              </label>
              <input
                type="text"
                name="zip_code"
                placeholder="6-digit PIN"
                maxLength="6"
                value={addressForm.zip_code}
                onChange={handleInputChange}
                className={style.input}
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div className={style.inputGroup}>
            <label className={style.label}>
              Phone <span className={style.requiredStar}>*</span>
            </label>
            <div className={style.phoneInputWrapper}>
              <div className={style.countryCode}>
                <span>🇮🇳</span>
                <span>+91</span>
              </div>
              <input
                type="tel"
                name="phone"
                placeholder="10-digit mobile number"
                maxLength="10"
                value={addressForm.phone}
                onChange={handleInputChange}
                className={style.input}
                required
              />
            </div>
            <span style={{ fontSize: "0.75rem", color: "#737373" }}>
              Required to ensure a successful delivery.
            </span>
          </div>

          <div className={style.formActions}>
            <button
              type="submit"
              className={style.confirmBtn}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Saving..."
                : editingAddressId
                  ? "Update Address"
                  : "Save & Deliver Here"}
            </button>

            {addresses.length > 0 && (
              <button
                type="button"
                className={style.cancelBtn}
                onClick={handleCancelForm}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
};

export default DeliveryAddressSection;

