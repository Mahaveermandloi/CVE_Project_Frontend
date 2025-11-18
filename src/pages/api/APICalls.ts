import axios from "axios";

export const API_BASE = "http://127.0.0.1:8000/api";

/* ----------------------------------------------------
   🔹 TYPES
---------------------------------------------------- */
export interface ChangeRecord {
  cveId: string;
  eventName: string;
  cveChangeId: string;
  sourceIdentifier: string;
  created: string;
  details: any[];
}

export interface CveChangeWrapper {
  change: ChangeRecord;
}

export interface Stats {
  resultsPerPage: number;
  startIndex: number;
  totalResults: number;
  format: string;
  version: string;
  timestamp: string;
}

export interface CveApiResponse extends Stats {
  cveChanges: CveChangeWrapper[];
}

export interface PaginatedChangeRecord {
  change: any;
  id: number;
  cveId: string;
  eventName: string;
  cveChangeId: string;
  sourceIdentifier: string;
  created: string;
  details: any[];
}

export interface PaginatedApiResponse {
  resultsPerPage: number;
  startIndex: number;
  totalResults: number;
  timestamp: string;
  data: PaginatedChangeRecord[];

  // optional UI flags
  isSearchResult?: boolean;
  isFilterResult?: boolean;
}

/* ----------------------------------------------------
   🔹 GET ONE — /cvechanges/{id}/
---------------------------------------------------- */
export const getCveChange = async (id: number): Promise<CveApiResponse> => {
  const response = await axios.get(`${API_BASE}/cvechanges/${id}/`);
  console.log("API Response:", response.data);
  return response.data;
};

/* ----------------------------------------------------
   🔹 READ FEW — /cvechanges/paginated/
---------------------------------------------------- */
export const getFewCveChanges = async (
  resultsPerPage: number,
  startIndex: number
): Promise<CveApiResponse> => {
  const response = await axios.get(
    `${API_BASE}/cvechanges/paginated/?resultsPerPage=${resultsPerPage}&startIndex=${startIndex}`
  );
  return response.data;
};

/* ----------------------------------------------------
   🔹 READ ALL — /cvechanges/
---------------------------------------------------- */
export const getAllCveChanges = async (): Promise<CveApiResponse> => {
  const response = await axios.get(`${API_BASE}/cvechanges/`);
  return response.data;
};

/* ----------------------------------------------------
   🔹 UPDATE — /cvechanges/update/{id}/
---------------------------------------------------- */

export const updateCveChange = async (id: number, payload: any) => {
  const response = await axios.put(
    `${API_BASE}/cvechanges/update/${id}/`,
    payload
  );
  
  return response.data;
};

/* ----------------------------------------------------
   🔹 DELETE — /cvechanges/delete/{id}
---------------------------------------------------- */
export const deleteCveChange = async (id: number) => {
  const response = await axios.delete(`${API_BASE}/cvechanges/delete/${id}/`);

  return response.data;
};

/* ----------------------------------------------------
   🔹 PAGINATED — /cvechanges/paginated/?resultsPerPage=${resultsPerPage}&startIndex=${startIndex}/{id}
---------------------------------------------------- */
export const getPaginatedCveChanges = async (
  resultsPerPage: number,
  startIndex: number
): Promise<PaginatedApiResponse> => {
  const response = await axios.get(
    `${API_BASE}/cvechanges/paginated/?resultsPerPage=${resultsPerPage}&startIndex=${startIndex}`
  );
  console.log("Paginated API:", response.data);
  return response.data;
};

/* ----------------------------------------------------
   🔹 SEARCH — /cvechanges/search/?query=xxxx
---------------------------------------------------- */
export const searchCveChanges = async (
  query: string,
  resultsPerPage: number,
  startIndex: number
): Promise<PaginatedApiResponse> => {
  const response = await axios.get(
    `${API_BASE}/cvechanges/search/?q=${query}&resultsPerPage=${resultsPerPage}&startIndex=${startIndex}`
  );

  return response.data;
};

/* ----------------------------------------------------
   🔹 FILTER — /cvechanges/filter/?event=...&startDate=...&endDate=...
---------------------------------------------------- */
export const filterCveChanges = async (
  events: string[] = [],
  startDate?: string, // format YYYY-MM-DD
  endDate?: string,
  resultsPerPage: number = 500,
  startIndex: number = 0
): Promise<PaginatedApiResponse> => {
  const params = new URLSearchParams();
  params.set("resultsPerPage", String(resultsPerPage));
  params.set("startIndex", String(startIndex));

  // append events as repeated 'event' params
  // biome-ignore lint/suspicious/useIterableCallbackReturn: <explanation>
  events.forEach((e) => params.append("event", e));

  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);

  const url = `${API_BASE}/cvechanges/filter/?${params.toString()}`;
  const response = await axios.get(url);
  return response.data;
};

/* ----------------------------------------------------
   🔹 EXPORT FILTERED DATA TO EXCEL
---------------------------------------------------- */
export const exportCveChangesToExcel = async (
  events: string[] = [],
  startDate?: string,
  endDate?: string
) => {
  // Build filter summary string
  let filterSummary = "";
  if (events.length || startDate || endDate) {
    filterSummary += "Filters selected:\n";
    if (events.length) filterSummary += `• Events: ${events.join(", ")}\n`;
    if (startDate) filterSummary += `• Start Date: ${startDate}\n`;
    if (endDate) filterSummary += `• End Date: ${endDate}\n`;
  } else {
    filterSummary = "No filters are applied.";
  }

  // Show prompt with confirmation
  const confirmMessage = `${filterSummary}\n\nThis export may take a while. Do you want to continue?`;
  const proceed = window.confirm(confirmMessage);
  if (!proceed) return false; // user canceled

  // Build query params
  const params = new URLSearchParams();
  // biome-ignore lint/suspicious/useIterableCallbackReturn: <explanation>
  events.forEach((e) => params.append("event", e));
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);

  const url = `${API_BASE}/cvechanges/export/?${params.toString()}`;

  try {
    // axios GET request with responseType 'blob' for Excel
    const response = await axios.get(url, { responseType: "blob" });

    // create a downloadable link
    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const link = document.createElement("a");
    const filename = `CVE_Changes_${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[:T]/g, "_")}.xlsx`;
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    link.click();

    return true;
  } catch (err) {
    console.error("Export failed:", err);
    alert("Failed to export Excel file");
    return false;
  }
};
