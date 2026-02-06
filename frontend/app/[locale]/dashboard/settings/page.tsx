"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { companyApi } from "@/lib/api/company";
import { CompanySettings, UpdateCompanyPayload } from "@/lib/api";


export default function CompanySettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [originalData, setOriginalData] = useState<CompanySettings | null>(null);
  const [formData, setFormData] = useState<CompanySettings | null>(null);

  // ========================
  // Fetch settings
  // ========================
  const loadCompanySettings = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const data = await companyApi.getSettings();

      // Normalize API data to always have string, no nulls
      const normalized: CompanySettings = {
        id: data.id,
        country: data.country,
        name: data.name,
        baseCurrency: data.baseCurrency,
        logoUrl: data.logoUrl ?? "", // convert null -> empty string
        defaultWeekdayHours: data.defaultWeekdayHours,
        defaultWeekendHours: data.defaultWeekendHours,
      };

      setOriginalData(normalized);
      setFormData(normalized);
    } catch (err) {
      console.error("Error loading company settings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCompanySettings();
  }, [loadCompanySettings]);

  // ========================
  // Dirty check
  // ========================
  const isDirty = useMemo(() => {
    if (!originalData || !formData) return false;
    return JSON.stringify(originalData) !== JSON.stringify(formData);
  }, [originalData, formData]);

  // ========================
  // Save settings
  // ========================
  const save = useCallback(async (): Promise<void> => {
    if (!formData || !isDirty) return;

    setSaving(true);
    try {
      // Convert logoUrl empty string to undefined for payload
      const payload: UpdateCompanyPayload = {
        name: formData.name,
        baseCurrency: formData.baseCurrency,
        logoUrl: formData.logoUrl || undefined,
        defaultWeekdayHours: formData.defaultWeekdayHours,
        defaultWeekendHours: formData.defaultWeekendHours,
      };

      const updated = await companyApi.updateSettings(payload);
      setOriginalData({
        ...formData,
        id: updated.id,
        country: updated.country,
      });
    } catch (err) {
      console.error("Error saving company settings:", err);
    } finally {
      setSaving(false);
    }
  }, [formData, isDirty]);

  if (loading || !formData) {
    return <div className="p-6 text-gray-500">Loading settings...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Company Settings</h1>
        <p className="text-gray-500 mt-1">
          Manage your company profile and default work rules.
        </p>
      </div>

      {/* Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
        {/* Company name */}
        <Field label="Company name">
          <input
            className="input w-full border border-gray-300 rounded px-3 py-2"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </Field>

        {/* Currency */}
        <Field label="Base currency">
          <select
            className="input w-full border border-gray-300 rounded px-3 py-2"
            value={formData.baseCurrency}
            onChange={(e) => setFormData({ ...formData, baseCurrency: e.target.value })}
          >
            <option value="EUR">EUR</option>
            <option value="RSD">RSD</option>
            <option value="CHF">CHF</option>
            <option value="USD">USD</option>
            <option value="GBP">GBP</option>
          </select>
        </Field>

        {/* Hours */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Default weekday hours">
            <input
              type="number"
              step={0.25}
              className="input w-full border border-gray-300 rounded px-3 py-2"
              value={formData.defaultWeekdayHours || ""}
              onChange={(e) =>
                setFormData({ ...formData, defaultWeekdayHours: e.target.value })
              }
            />
          </Field>

          <Field label="Default weekend hours">
            <input
              type="number"
              step={0.25}
              className="input w-full border border-gray-300 rounded px-3 py-2"
              value={formData.defaultWeekendHours || ""}
              onChange={(e) =>
                setFormData({ ...formData, defaultWeekendHours: e.target.value })
              }
            />
          </Field>
        </div>

        {/* Logo */}
        <Field label="Logo URL">
          <input
            className="input w-full border border-gray-300 rounded px-3 py-2"
            value={formData.logoUrl || ""}
            onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
          />
        </Field>
      </div>

      {/* Sticky save bar */}
      <div
        className={`fixed bottom-6 right-6 transition ${
          isDirty ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <button
          onClick={save}
          disabled={!isDirty || saving}
          className={`rounded-xl px-6 py-3 font-medium transition
            ${isDirty ? "bg-blue-500 hover:bg-blue-600 text-white" : "bg-gray-300 text-gray-500"}
          `}
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </div>
  );
}

/* ========================
   Reusable Field
======================== */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1 text-gray-700">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
