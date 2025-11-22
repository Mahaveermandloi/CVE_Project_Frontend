/** biome-ignore-all lint/a11y/noLabelWithoutControl: <explanation> */
import { useState } from "react";
import { createCveChange } from "../pages/api/APICalls";

const EVENT_OPTIONS = [
  "CVE Received",
  "Initial Analysis",
  "Reanalysis",
  "CVE Modified",
  "Modified Analysis",
  "CVE Translated",
  "Vendor Comment",
  "CVE Source Update",
  "CPE Deprecation Remap",
  "CWE Remap",
  "Reference Tag Update",
  "CVE Rejected",
  "CVE Unrejected",
  "CVE CISA KEV Update",
];

interface CreateCveModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

interface FormState {
  cveId: string;
  eventName: string;
  cveChangeId: string;
  sourceIdentifier: string;
  created: string;
  details: string;
}

interface FormErrors {
  cveId: string;
  eventName: string;
  cveChangeId: string;
  sourceIdentifier: string;
  created: string;
  details: string;
}

export default function CreateCveModal({
  open,
  onClose,
  onCreated,
}: CreateCveModalProps) {
  const [form, setForm] = useState<FormState>({
    cveId: "",
    eventName: "",
    cveChangeId: "",
    sourceIdentifier: "",
    created: "",
    details: "[]",
  });

  const [errors, setErrors] = useState<FormErrors>({
    cveId: "",
    eventName: "",
    cveChangeId: "",
    sourceIdentifier: "",
    created: "",
    details: "",
  });

  if (!open) return null;

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleInputChange = (key: keyof FormState, value: string) => {
    setForm({ ...form, [key]: value });
    const newErrors: FormErrors = { ...errors };

    if (!value.trim()) {
      newErrors[key] = `${key} cannot be empty.`;
    } else {
      newErrors[key] = "";
    }

    if (key === "sourceIdentifier" && value.trim()) {
      newErrors.sourceIdentifier = validateEmail(value)
        ? ""
        : "Invalid email format.";
    }

    setErrors(newErrors);
  };

  const handleDetailsChange = (value: string) => {
    setForm({ ...form, details: value });
    try {
      JSON.parse(value);
      setErrors({ ...errors, details: "" });
    } catch {
      setErrors({ ...errors, details: "Invalid JSON format!" });
    }
  };

  const isSaveDisabled =
    Object.values(errors).some((e) => e !== "") ||
    Object.values(form).some((f) => f.trim() === "");

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/80">
      <div className="bg-white p-6 rounded shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Create CVE Record</h2>

        {/* CVE ID */}
        <label>CVE ID</label>
        <input
          className="border p-2 w-full mb-1"
          value={form.cveId}
          onChange={(e) => handleInputChange("cveId", e.target.value)}
        />
        {errors.cveId && (
          <p className="text-red-600 text-sm mb-2">{errors.cveId}</p>
        )}

        {/* Event Name */}
        <label>Event Name</label>
        <select
          className="border p-2 w-full mb-3"
          value={form.eventName}
          onChange={(e) => handleInputChange("eventName", e.target.value)}
        >
          <option value="">Select Event</option>
          {EVENT_OPTIONS.map((event) => (
            <option key={event} value={event}>
              {event}
            </option>
          ))}
        </select>
        {errors.eventName && (
          <p className="text-red-600 text-sm mb-2">{errors.eventName}</p>
        )}

        {/* Change ID */}
        <label>Change ID</label>
        <input
          className="border p-2 w-full mb-3"
          value={form.cveChangeId}
          onChange={(e) => handleInputChange("cveChangeId", e.target.value)}
        />
        {errors.cveChangeId && (
          <p className="text-red-600 text-sm mb-2">{errors.cveChangeId}</p>
        )}

        {/* Source Identifier */}
        <label>Source Identifier (Email)</label>
        <input
          className="border p-2 w-full mb-1"
          value={form.sourceIdentifier}
          onChange={(e) =>
            handleInputChange("sourceIdentifier", e.target.value)
          }
        />
        {errors.sourceIdentifier && (
          <p className="text-red-600 text-sm mb-2">{errors.sourceIdentifier}</p>
        )}

        {/* Created */}
        <label>Created</label>
        <input
          type="datetime-local"
          className="border p-2 w-full mb-1"
          value={form.created}
          onChange={(e) => handleInputChange("created", e.target.value)}
        />
        {errors.created && (
          <p className="text-red-600 text-sm mb-2">{errors.created}</p>
        )}

        {/* Details JSON */}
        <label className="font-semibold mt-4">Details (JSON)</label>
        <textarea
          className="border p-2 w-full mb-2 font-mono text-sm"
          rows={10}
          value={form.details}
          onChange={(e) => handleDetailsChange(e.target.value)}
        />
        {errors.details && (
          <p className="text-red-600 text-sm mb-2">{errors.details}</p>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            type="button"
            className="px-4 py-2 bg-gray-300 rounded"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isSaveDisabled}
            className={`px-4 py-2 text-white rounded ${
              isSaveDisabled ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600"
            }`}
            onClick={async () => {
              if (isSaveDisabled) return;

              try {
                await createCveChange({
                  cveId: form.cveId,
                  eventName: form.eventName,
                  cveChangeId: form.cveChangeId,
                  sourceIdentifier: form.sourceIdentifier,
                  created: form.created,
                  details: JSON.parse(form.details),
                });

                onCreated();
                onClose();
              } catch (err) {
                console.error("Create failed", err);
                alert("Failed to create CVE record!");
              }
            }}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
