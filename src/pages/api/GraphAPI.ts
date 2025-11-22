// // src/api/APICalls.ts
import axios from "axios";

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000/api";

export interface EventCountsResponse {
  timestamp: string;
  total_events_counted: number;
  event_counts: Record<string, number>;
}

// existing function you showed
export const getEventCounts = async (): Promise<EventCountsResponse> => {
  const url = `${API_BASE.replace(/\/$/, "")}/event-counts/`;
  const resp = await axios.get<EventCountsResponse>(url);
  return resp.data;
};

/* ---------- New: CVE year counts ---------- */

export type YearCountItem = {
  event_year: number;
  count: number;
};

export type CveYearCountsResponse = {
  year_counts: YearCountItem[];
};

/**
 * Fetch CVE year counts from /cve-year-counts/
 */
export const getCveYearCounts = async (): Promise<CveYearCountsResponse> => {
  const url = `${API_BASE.replace(/\/$/, "")}/cve-year-counts/`;
  const resp = await axios.get<CveYearCountsResponse>(url);
  return resp.data;
};





export interface TopSourceItem {
  source: string;
  total_count: number;
}

export interface TopSourcesResponse {
  timestamp: string;
  limit: number;
  top_sources: TopSourceItem[];
}

/* -------- API CALL ---------- */

export const getTopSources = async (): Promise<TopSourcesResponse> => {
  const url = `${API_BASE}/top-sources/`;
  const response = await axios.get<TopSourcesResponse>(url);
  return response.data;
};





export type AnalysisStatusItem = {
  status_label: string;
  count: number;
};

export type AnalysisStatusResponse = {
  timestamp: string;
  total_statuses: number;
  analysis_status: AnalysisStatusItem[];
};

/**
 * Fetch analysis status counts from /analysis-status/
 */
export const getAnalysisStatus = async (): Promise<AnalysisStatusResponse> => {
  const url = `${API_BASE.replace(/\/$/, "")}/analysis-status/`;
  const resp = await axios.get<AnalysisStatusResponse>(url);
  return resp.data;
};




export type Point = { x: number; y: number };

export type SeriesItem = {
  eventName: string;
  points: Point[];
};

export type CveScatterResponse = {
  timestamp: string;
  series: SeriesItem[];
  meta?: {
    total_event_names?: number;
    [k: string]: any;
  };
  sample_plot_image?: string;
};

/**
 * Fetch CVE scatter series used by the frontend scatter plot.
 */
export const getCveScatter = async (): Promise<CveScatterResponse> => {
  const url = `${API_BASE.replace(/\/$/, "")}/cve-scatter/`;
  const resp = await axios.get<CveScatterResponse>(url);
  return resp.data;
};



export type MonthlyEvent = {
  eventName: string;
  monthly: number[]; // length 12, Jan..Dec
  total: number;
};

export type MonthlyEventResponse = {
  timestamp: string;
  year: number;
  top_n?: number;
  events: MonthlyEvent[];
  available_years: number[];
  sample_plot_image?: string; // will contain the uploaded local path like /mnt/data/...
};

/**
 * Fetch monthly event trends for a given year.
 * If year is omitted, backend will default to current year.
 */
export const getMonthlyEventTrends = async (year?: number): Promise<MonthlyEventResponse> => {
  const q = year ? `?year=${encodeURIComponent(String(year))}` : "";
  const url = `${API_BASE.replace(/\/$/, "")}/monthly-event-trends/${q}`;
  const resp = await axios.get<MonthlyEventResponse>(url);
  return resp.data;
};