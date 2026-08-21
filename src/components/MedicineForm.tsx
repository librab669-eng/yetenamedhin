"use client";

import { useState } from "react";
import { Plus, Pencil, X } from "lucide-react";
import { useLang } from "@/lib/lang-context";
import { createMedicine, updateMedicine, deleteMedicine } from "@/app/actions";

export default function MedicineForm({
  mode,
  medicine,
}: {
  mode: "create" | "edit";
  medicine?: {
    id: number;
    name: string;
    nameAm: string | null;
    unit: string;
    pricePerUnit: number | { toString(): string };
    isActive: boolean;
  };
}) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);

  return (
    <>
      {mode === "create" ? (
        <button className="btn btn-primary" onClick={() => setOpen(true)}>
          <Plus size={18} /> {t("addMedicine")}
        </button>
      ) : (
        <button className="btn btn-sm btn-ghost" onClick={() => setOpen(true)}>
          <Pencil size={14} /> {t("edit")}
        </button>
      )}

      {open ? (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {mode === "create" ? t("addMedicine") : t("editMedicine")}
              </h3>
              <button className="btn btn-sm" onClick={() => setOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form
              action={async (formData) => {
                if (mode === "edit" && medicine) {
                  await updateMedicine(medicine.id, formData);
                } else {
                  await createMedicine(formData);
                }
                setOpen(false);
              }}
            >
              <div className="field">
                <label className="label">{t("medicineName")} *</label>
                <input className="input" name="name" required defaultValue={medicine?.name} />
              </div>
              <div className="field">
                <label className="label">{t("medicineNameAm")}</label>
                <input className="input" name="nameAm" defaultValue={medicine?.nameAm ?? ""} />
              </div>
              <div className="grid grid-2">
                <div className="field">
                  <label className="label">{t("unit")}</label>
                  <input className="input" name="unit" defaultValue={medicine?.unit ?? "tab"} />
                </div>
                <div className="field">
                  <label className="label">{t("pricePerUnit")}</label>
                  <input
                    className="input"
                    name="pricePerUnit"
                    type="number"
                    min="0"
                    step="any"
                    defaultValue={medicine ? Number(medicine.pricePerUnit) : ""}
                    required
                  />
                </div>
              </div>
              {mode === "edit" && medicine ? (
                <div className="field">
                  <label className="label">{t("status")}</label>
                  <select className="select" name="isActive" defaultValue={medicine.isActive ? "on" : "off"}>
                    <option value="on">{t("active")}</option>
                    <option value="off">{t("inactive")}</option>
                  </select>
                </div>
              ) : null}

              <div className="modal-footer">
                {mode === "edit" && medicine ? (
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={async () => {
                      await deleteMedicine(medicine.id);
                      setOpen(false);
                    }}
                  >
                    {t("delete")}
                  </button>
                ) : null}
                <button type="button" className="btn" onClick={() => setOpen(false)}>
                  {t("cancel")}
                </button>
                <button className="btn btn-primary" type="submit">
                  {t("save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}