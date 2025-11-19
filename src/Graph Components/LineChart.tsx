import React from "react";
import { LineChart as MUILineChart } from "@mui/x-charts/LineChart";

interface Props {
  years: number[];
  counts: number[];
}

export default function LineChart({ years, counts }: Props) {
  return (
    <MUILineChart
      xAxis={[
        {
          data: years,
          label: "Year",
          valueFormatter: (value: any) => String(value),
        },
      ]}
      yAxis={[
        {
          label: "Total CVEs",
          valueFormatter: (value: number) => value.toLocaleString("en-IN"),
          tickMinStep: 1, // 🔥 stops MUI from abbreviating large values
          tickLabelStyle: {
            fontSize: 12,
            fontWeight: 600,
          },
        },
      ]}
      series={[
        {
          data: counts,
          label: "Total CVEs",
          area: true,
          curve: "monotoneX",
        },
      ]}
      height={350}
    />
  );
}
