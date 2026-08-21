"use client";

import { useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/lang-context";
import { createPatient, updatePatient } from "@/app/actions";

interface FamilyOption {
  id: number;
  familyCode: string;
  headName: string;
  patients: { id: number; fullName: string }[];
}

export default function PatientForm({
  mode,
  families,
  defaultYear,
  patient,
}: {
  mode: "create" | "edit";
  families: FamilyOption[];
  defaultYear: number;
  patient?: {
    id: number;
    fullName: string;
    gender: string | null;
    ageOrBirth: string | null;
    cardNo: string | null;
    relationToHead: string | null;
    familyId: number;
    notes?: string | null;
  };
}) {
  const { t, lang } = useLang();
  const [mode2, setMode2] = useState<"new" | "existing">(
    patient ? "existing" : "new"
  );
  const [familyId, setFamilyId] = useState<number>(patient?.familyId ?? 0);

  const family = families.find((f) => f.id === Number(familyId));

  return (
    <div className="card">
      <form
        action={async (formData) => {
          if (mode === "edit" && patient) {
            await updatePatient(patient.id, formData);
          } else {
            await createPatient(formData);
          }
        }}
      >
        <input type="hidden" name="ethYear" value={defaultYear} />
        {mode === "edit" && patient ? (
          <input type="hidden" name="familyId" value={patient.familyId} />
        ) : null}

        <div className="grid grid-2" style={{ marginBottom: 16 }}>
          {mode === "create" ? (
            <div className="field">
              <label className="label">{t("family")}</label>
              <div className="row" style={{ gap: 8, marginBottom: 12 }}>
                <button
                  type="button"
                  className={`btn btn-sm ${mode2 === "new" ? "btn-primary" : ""}`}
                  onClick={() => setMode2("new")}
                >
                  {t("newFamily")}
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${mode2 === "existing" ? "btn-primary" : ""}`}
                  onClick={() => setMode2("existing")}
                >
                  {t("existingFamily")}
                </button>
              </div>

              {mode2 === "new" ? (
                <>
                  <div className="field">
                    <label className="label">{t("headName")}</label>
                    <input className="input" name="headName" required />
                  </div>
                  <div className="grid grid-2">
                    <div className="field">
                      <label className="label">{t("phone")} ({t("optional")})</label>
                      <input className="input" name="phone" />
                    </div>
                    <div className="field">
                      <label className="label">{t("address")} ({t("optional")})</label>
                      <input className="input" name="address" />
                    </div>
                  </div>
                </>
              ) : (
                <div className="field">
                  <label className="label">{t("selectFamily")}</label>
                  <select
                    className="select"
                    name="familyId"
                    value={familyId}
                    onChange={(e) => setFamilyId(Number(e.target.value))}
                  >
                    <option value={0} disabled>
                      {t("select")}
                    </option>
                    {families.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.familyCode} — {f.headName}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ) : null}

          <div className="field">
            <label className="label">{t("name")} *</label>
            <input className="input" name="fullName" required defaultValue={patient?.fullName} />
          </div>
        </div>

        <div className="grid grid-2">
          <div className="field">
            <label className="label">{t("gender")}</label>
            <select className="select" name="gender" defaultValue={patient?.gender ?? ""}>
              <option value="">{t("select")}</option>
              <option value="male">{t("male")}</option>
              <option value="female">{t("female")}</option>
            </select>
          </div>
          <div className="field">
            <label className="label">{t("ageOrBirth")}</label>
            <input className="input" name="ageOrBirth" defaultValue={patient?.ageOrBirth ?? ""} />
          </div>
          <div className="field">
            <label className="label">{t("cardNo")}</label>
            <input className="input" name="cardNo" defaultValue={patient?.cardNo ?? ""} />
          </div>
          <div className="field">
            <label className="label">{t("relationToHead")}</label>
            <input className="input" name="relationToHead" defaultValue={patient?.relationToHead ?? ""} />
          </div>
        </div>

        <div className="field">
          <label className="label">{t("notes")} ({t("optional")})</label>
          <textarea className="textarea" name="notes" rows={2} defaultValue={patient?.notes ?? ""} />
        </div>

        <div className="row" style={{ justifyContent: "flex-end", gap: 12 }}>
          <Link href="/patients" className="btn">
            {t("cancel")}
          </Link>
          <button className="btn btn-primary" type="submit">
            {t("save")}
          </button>
        </div>
      </form>
    </div>
  );
}