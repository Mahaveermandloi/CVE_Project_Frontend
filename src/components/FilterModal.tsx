import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";

type Props = {
  open: boolean;
  onClose: () => void;
  onApply: (payload: {
    events: string[];
    startDate?: string;
    endDate?: string;
  }) => void;

  // initial filter values from Dashboard
  initialEvents: string[];
  initialStartDate?: string;
  initialEndDate?: string;
};

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

export default function FilterModal({
  open,
  onClose,
  onApply,
  initialEvents,
  initialStartDate,
  initialEndDate,
}: Props) {
  const router = useRouter();

  const [selectedEvents, setSelectedEvents] = useState<string[]>(initialEvents);
  const [startDate, setStartDate] = useState<string>(initialStartDate || "");
  const [endDate, setEndDate] = useState<string>(initialEndDate || "");

  useEffect(() => {
    if (open) {
      setSelectedEvents(initialEvents);
      setStartDate(initialStartDate || "");
      setEndDate(initialEndDate || "");
    }
  }, [open, initialEvents, initialStartDate, initialEndDate]);

  const toggleEvent = (ev: string) => {
    setSelectedEvents((prev) =>
      prev.includes(ev) ? prev.filter((p) => p !== ev) : [...prev, ev]
    );
  };

  const apply = () => {
    if (startDate && !endDate) setEndDate(startDate);

    onApply({
      events: selectedEvents,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

    onClose();
  };

  const clearFilters = () => {
    setSelectedEvents([]);
    setStartDate("");
    setEndDate("");

    onApply({
      events: [],
      startDate: undefined,
      endDate: undefined,
    });

    onClose();
  };
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex justify-center items-start pt-20">
      <div className="bg-white rounded-lg shadow-lg w-[720px] p-6">
        <h3 className="text-lg font-semibold mb-4">Filters</h3>

        <div className="grid grid-cols-2 gap-6">
          {/* Event Filter */}
          <div>
            {/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
            <label className="block font-medium mb-2">Event Name</label>
            <div className="max-h-40 overflow-y-auto border rounded p-2">
              {EVENT_OPTIONS.map((ev) => (
                <label key={ev} className="flex items-center gap-2 mb-1">
                  <input
                    type="checkbox"
                    checked={selectedEvents.includes(ev)}
                    onChange={() => toggleEvent(ev)}
                  />
                  <span className="text-sm">{ev}</span>
                </label>
              ))}
            </div>

            <p className="text-xs text-gray-500 mt-2">
              Select one or more event types
            </p>
          </div>

          {/* Date Range Filter */}
          <div>
            {/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
            <label className="block font-medium mb-2">Date range</label>
            <div className="flex items-center gap-2">
              <div>
                <div className="text-xs text-gray-600">Start</div>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border rounded px-2 py-1"
                />
              </div>

              <div>
                <div className="text-xs text-gray-600">End</div>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border rounded px-2 py-1"
                />
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-2">
              If only start date is selected, filter will apply for that single
              day.
            </p>
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center ">
          <button
            type="button"
            className="px-4 py-2 rounded border bg-gray-200"
            onClick={clearFilters}
          >
            Clear Filters
          </button>

          {/* Buttons */}
          <div className="flex  gap-3 ">
            <button
              type="button"
              className="px-4 py-2 rounded border"
              onClick={onClose}
            >
              Close
            </button>

            <button
              type="button"
              className="px-4 py-2 rounded bg-blue-600 text-white"
              onClick={apply}
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
