// src/components/FilterBox.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  getEventOptions,
  createEventOption,
  type EventOption,
  type CreateEventResult,
} from "../pages/api/APICalls";

type Props = {
  onApply: (payload: {
    events: string[];
    startDate?: string;
    endDate?: string;
  }) => void;

  initialEvents?: string[];
  initialStartDate?: string;
  initialEndDate?: string;
};

const REFERENCE_IMAGE_PATH =
  "/mnt/data/fe9cbd49-5480-4bc9-a1f6-83aeef865b56.png";

export const FilterBox: React.FC<Props> = ({
  onApply,
  initialEvents = [],
  initialStartDate,
  initialEndDate,
}) => {
  // basic filter state
  const [selectedEvents, setSelectedEvents] = useState<string[]>(initialEvents);
  const [startDate, setStartDate] = useState<string>(initialStartDate ?? "");
  const [endDate, setEndDate] = useState<string>(initialEndDate ?? "");
  const [dateError, setDateError] = useState<string>("");

  // options from backend
  const [eventOptions, setEventOptions] = useState<EventOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState<boolean>(true);

  // create new option UI
  const [showCreateInput, setShowCreateInput] = useState<boolean>(false);
  const [newEventName, setNewEventName] = useState<string>("");
  const [createLoading, setCreateLoading] = useState<boolean>(false);

  // UI messages
  const [showMessage, setShowMessage] = useState<boolean>(false);
  const [messageText, setMessageText] = useState<string>("");

  const inputRef = useRef<HTMLInputElement | null>(null);
  const today = new Date().toISOString().split("T")[0];

  // fetch event options from server
  // const loadEventOptions = async () => {
  //   try {
  //     setLoadingOptions(true);
  //     const resp = await getEventOptions();
  //     // `resp` from your earlier code returns { data: EventOption[] } — handle both shapes
  //     if (Array.isArray((resp as any).data)) {
  //       setEventOptions((resp as any).data as EventOption[]);
  //     } else if (Array.isArray(resp as any)) {
  //       setEventOptions(resp as EventOption[]);
  //     // biome-ignore lint/suspicious/noDuplicateElseIf: <explanation>
  //     } else if ((resp as any).data && Array.isArray((resp as any).data)) {
  //       setEventOptions((resp as any).data as EventOption[]);
  //     } else {
  //       // fallback: try to coerce
  //       setEventOptions((resp as any) ?? []);
  //     }
  //   } catch (err) {
  //     console.error("Failed to fetch event options:", err);
  //   } finally {
  //     setLoadingOptions(false);
  //   }
  // };

  const loadEventOptions = React.useCallback(async () => {
    try {
      setLoadingOptions(true);
      const resp = await getEventOptions();

      if (Array.isArray((resp as any).data)) {
        setEventOptions((resp as any).data);
      } else if (Array.isArray(resp as any)) {
        setEventOptions(resp as any);
        // biome-ignore lint/suspicious/noDuplicateElseIf: <explanation>
      } else if ((resp as any).data && Array.isArray((resp as any).data)) {
        setEventOptions((resp as any).data);
      } else {
        setEventOptions((resp as any) ?? []);
      }
    } catch (err) {
      console.error("Failed to fetch event options:", err);
    } finally {
      setLoadingOptions(false);
    }
  }, []);

  useEffect(() => {
    loadEventOptions();
  }, [loadEventOptions]);

  // keep synced with parent initial props
  useEffect(() => {
    setSelectedEvents(initialEvents);
    setStartDate(initialStartDate ?? "");
    setEndDate(initialEndDate ?? "");
    setDateError("");
  }, [initialEvents, initialStartDate, initialEndDate]);

  // utility toggles
  const toggleEvent = (ev: string) =>
    setSelectedEvents((prev) =>
      prev.includes(ev) ? prev.filter((p) => p !== ev) : [...prev, ev]
    );

  // date validators
  const validateDates = (newStart: string, newEnd: string) => {
    if (newStart && newStart > today) {
      setDateError("Start date cannot be in the future.");
      return;
    }
    if (newEnd && newEnd > today) {
      setDateError("End date cannot be greater than today's date.");
      return;
    }
    if (newStart && newEnd && newEnd < newStart) {
      setDateError("End date cannot be earlier than Start date.");
      return;
    }
    setDateError("");
  };

  const handleStartChange = (value: string) => {
    setStartDate(value);
    validateDates(value, endDate);
  };

  const handleEndChange = (value: string) => {
    setEndDate(value);
    validateDates(startDate, value);
  };

  // apply & clear
  const noFiltersSelected =
    selectedEvents.length === 0 &&
    startDate.trim() === "" &&
    endDate.trim() === "";

  const disableApply = noFiltersSelected || dateError !== "";

  const doApply = () => {
    const finalEnd = startDate && !endDate ? startDate : endDate || undefined;
    onApply({
      events: selectedEvents,
      startDate: startDate || undefined,
      endDate: finalEnd,
    });
  };

  const onApplyClick = () => {
    if (disableApply) {
      setMessageText("No filters applied");
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 2500);
      return;
    }
    doApply();
  };

  const onClearClick = () => {
    if (noFiltersSelected) {
      setMessageText("No filters applied");
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 2500);
      return;
    }

    setSelectedEvents([]);
    setStartDate("");
    setEndDate("");
    setDateError("");

    onApply({ events: [], startDate: undefined, endDate: undefined });
  };

  // create new event option (POST) and then reload list & select it
  const onSubmitCreate = async () => {
    const trimmed = newEventName.trim();
    if (!trimmed) {
      setMessageText("Enter a name before submitting");
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 2000);
      return;
    }

    // quick duplicate check (case-insensitive) against currently loaded options
    const exists = eventOptions.some(
      (o) => o.eventName.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      setMessageText("This event already exists");
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 2000);
      return;
    }

    try {
      setCreateLoading(true);
      const result: CreateEventResult = await createEventOption(trimmed);
      if (!result.success) {
        setMessageText(result.message ?? "Failed to create event");
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 2000);
        return;
      }

      // success: reload options then select the created name
      await loadEventOptions();

      setSelectedEvents((prev) => {
        // add if not present
        if (!prev.includes(trimmed)) return [...prev, trimmed];
        return prev;
      });

      setShowCreateInput(false);
      setNewEventName("");
      setMessageText("Event created");
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 1800);
    } catch (err) {
      console.error("Failed to create event option:", err);
      setMessageText("Failed to create event");
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 2000);
    } finally {
      setCreateLoading(false);
    }
  };

  // focus input when shown
  useEffect(() => {
    if (showCreateInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showCreateInput]);

  return (
    <aside className="w-1/5 p-4 shadow-2xl bg-white rounded-lg">
      {/* optional reference image */}

      <h2 className="text-lg font-semibold mb-2">Filters</h2>
      <hr className="text-gray-300" />

      {/* Event Filter */}
      <div className="my-2">
        <div className="flex justify-between items-center p-2">
          {/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
          <label className="block font-medium mb-2">Event Name</label>

          <button
            type="button"
            onClick={() => setShowCreateInput(true)}
            className="rounded text-white text-xs p-1 bg-[#01308b] hover:bg-blue-700"
          >
            Create
          </button>
        </div>

        {/* Combined container with fixed height so create box doesn't expand overall height */}
        <div className="flex flex-col max-h-56">
          {/* Create input area (inside fixed container) */}
          {showCreateInput && (
            <div className="p-2 mb-2 border rounded bg-gray-50 flex-shrink-0">
              <div className="text-sm text-gray-700 mb-1">Create new event</div>
              <input
                ref={inputRef}
                type="text"
                value={newEventName}
                onChange={(e) => setNewEventName(e.target.value)}
                placeholder="e.g. Custom Analysis"
                className="w-full border rounded px-2 py-1 mb-2"
                aria-label="New event name"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onSubmitCreate}
                  disabled={createLoading}
                  className="px-3 py-1 bg-[#01308b] text-white rounded text-sm"
                >
                  {createLoading ? "Saving..." : "Submit"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateInput(false);
                    setNewEventName("");
                  }}
                  className="px-3 py-1 bg-gray-200 text-black rounded text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Scrollable list that shrinks when create box is shown */}
          <div className="overflow-y-auto border rounded p-2 flex-1 min-h-0">
            {loadingOptions ? (
              <div className="text-sm text-gray-500">Loading options…</div>
            ) : (
              eventOptions.map((opt) => (
                <label
                  key={opt.id}
                  className="flex items-center gap-2 mb-1 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedEvents.includes(opt.eventName)}
                    onChange={() => toggleEvent(opt.eventName)}
                    className="accent-blue-600"
                  />
                  <span className="text-sm">{opt.eventName}</span>
                </label>
              ))
            )}
          </div>
        </div>

        <p className="text-xs text-gray-700 mt-2">
          Select one or more event types
        </p>
      </div>

      {/* Date Range */}
      <div className="mb-4">
        {/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
        <label className="block font-medium mb-2">Date range</label>
        <div className="flex flex-col gap-3">
          <div>
            <div className="text-xs text-gray-700">Start</div>
            <input
              type="date"
              value={startDate}
              max={today}
              onChange={(e) => handleStartChange(e.target.value)}
              className="border rounded px-2 py-1"
            />
          </div>

          <div>
            <div className="text-xs text-gray-700">End</div>
            <input
              type="date"
              value={endDate}
              max={today}
              disabled={!startDate}
              onChange={(e) => handleEndChange(e.target.value)}
              className={`border rounded px-2 py-1 ${
                !startDate ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
            />
          </div>
        </div>

        {dateError && <p className="text-red-700 text-sm mt-2">{dateError}</p>}
      </div>

      {/* Buttons */}
      <div className="flex gap-3 mt-4 items-center">
        <button
          type="button"
          className="px-3 py-2 w-1/2 rounded border bg-white text-black"
          onClick={onClearClick}
        >
          Clear Filters
        </button>

        <button
          type="button"
          onClick={onApplyClick}
          className={`px-3 py-2 rounded text-white w-1/2 ${
            disableApply ? "bg-gray-400 cursor-not-allowed" : "bg-[#01308b]"
          }`}
        >
          Apply
        </button>
      </div>

      {/* transient message */}
      {showMessage && (
        <div className="mt-3 text-sm text-red-600 font-medium">
          {messageText}
        </div>
      )}
    </aside>
  );
};

export default FilterBox;
