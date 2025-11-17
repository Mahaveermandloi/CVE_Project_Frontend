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
  isSearchResult: any;
  resultsPerPage: number;
  startIndex: number;
  totalResults: number;
  timestamp: string;
  data: PaginatedChangeRecord[];
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
export const updateCveChange = async (
  id: number,
  payload: Partial<ChangeRecord>
) => {
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
  const response = await axios.delete(`${API_BASE}/cvechanges/delete/${id}`);
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



