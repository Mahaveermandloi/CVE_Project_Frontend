/** biome-ignore-all lint/a11y/noLabelWithoutControl: <explanation> */
import { useEffect, useState } from "react";
import { updateCveChange } from "../pages/api/APICalls";

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

interface EditCveModalProps {
  open: boolean;
  record: any | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function EditCveModal({
  open,
  record,
  onClose,
  onSaved,
}: EditCveModalProps) {
  const [form, setForm] = useState({
    id: "",
    cveId: "",
    eventName: "",
    cveChangeId: "",
    sourceIdentifier: "",
    created: "",
    details: "[]", // JSON text
  });

  const [errors, setErrors] = useState({
    cveId: "",
    sourceIdentifier: "",
    created: "",
  });

  const [jsonError, setJsonError] = useState("");

  useEffect(() => {
    if (record) {
      setForm({
        id: record.id ?? "",
        cveId: record.cveId ?? "",
        eventName: record.eventName ?? "",
        cveChangeId: record.cveChangeId ?? "",
        sourceIdentifier: record.sourceIdentifier ?? "",
        created: record.created ?? "",
        details: JSON.stringify(record.details ?? [], null, 2),
      });
    }
  }, [record]);

  if (!open) return null;

  // ------------ VALIDATION ------------
  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validateDateTime = (value: string) => {
    return !isNaN(Date.parse(value));
  };

  const handleInputChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });

    let newErrors = { ...errors };

    if (key === "cveId") {
      newErrors.cveId = value.trim() === "" ? "CVE ID cannot be empty." : "";
    }

    if (key === "sourceIdentifier") {
      newErrors.sourceIdentifier = validateEmail(value)
        ? ""
        : "Invalid email format.";
    }

    if (key === "created") {
      newErrors.created = validateDateTime(value)
        ? ""
        : "Invalid date/time format.";
    }

    setErrors(newErrors);
  };

  const handleDetailsChange = (value: string) => {
    setForm({ ...form, details: value });

    try {
      JSON.parse(value);
      setJsonError("");
    } catch {
      setJsonError("Invalid JSON format!");
    }
  };

  const isSaveDisabled =
    jsonError !== "" ||
    errors.cveId !== "" ||
    errors.sourceIdentifier !== "" ||
    errors.created !== "";

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/40">
      <div className="bg-white p-6 rounded shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Edit CVE Record</h2>
        {/* ---------- ID (Read Only) ---------- */}
        <label>ID</label>
        <input
          className="border p-2 w-full mb-3 bg-gray-100 cursor-not-allowed"
          value={form.id}
          readOnly
        />

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
        {/* Event Name Dropdown */}
        <label>Event Name</label>
        <select
          className="border p-2 w-full mb-3"
          value={form.eventName}
          onChange={(e) => setForm({ ...form, eventName: e.target.value })}
        >
          <option value="">Select Event</option>
          {EVENT_OPTIONS.map((event) => (
            <option key={event} value={event}>
              {event}
            </option>
          ))}
        </select>
        {/* Change ID */}
        <label>Change ID</label>
        <input
          className="border p-2 w-full mb-3"
          value={form.cveChangeId}
          onChange={(e) => setForm({ ...form, cveChangeId: e.target.value })}
        />
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
        <label>Created (Date / DateTime)</label>
        <input
          className="border p-2 w-full mb-1"
          value={form.created}
          onChange={(e) => handleInputChange("created", e.target.value)}
        />
        {errors.created && (
          <p className="text-red-600 text-sm mb-2">{errors.created}</p>
        )}
        {/* JSON DETAILS */}
        <label className="font-semibold mt-4">Details (JSON)</label>
        <textarea
          className="border p-2 w-full mb-2 font-mono text-sm"
          rows={10}
          value={form.details}
          onChange={(e) => handleDetailsChange(e.target.value)}
        />
        {jsonError && <p className="text-red-600 text-sm mb-2">{jsonError}</p>}
        {/* BUTTONS */}
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
                await updateCveChange(record.id, {
                  cveId: form.cveId,
                  eventName: form.eventName,
                  cveChangeId: form.cveChangeId,
                  sourceIdentifier: form.sourceIdentifier,
                  created: form.created,
                  details: JSON.parse(form.details),
                });

                onSaved();
                onClose();
              } catch (err) {
                console.error("Update failed", err);
                alert("Update failed!");
              }
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
