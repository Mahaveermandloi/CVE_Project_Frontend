// import React from "react";
// import { PieChart as MUIPieChart } from "@mui/x-charts/PieChart";
// import Loader from "../components/Loader"; // optional fallback

// export default function PieChart({ data, loading }) {
//   const valueFormatter = (item) => `${item.value}`;

//   return (
//     <div className="flex justify-center items-center p-4">
//       {loading ? (
//         <Loader />
//       ) : (
//         <MUIPieChart
//           series={[
//             {
//               type: "pie",
//               data,
//               highlightScope: { fade: "global", highlight: "item" },
//               faded: { innerRadius: 40, additionalRadius: -10, color: "gray" },
//               valueFormatter,
//               arcLabelMinAngle: 20,
//             },
//           ]}
//           height={500}
//           width={500}
//         />
//       )}
//     </div>
//   );
// }


import React from "react";
import { PieChart as MUIPieChart } from "@mui/x-charts/PieChart";

// Define type for props
interface PieChartProps {
  data: {
    id: string;
    value: number;
    label: string;
    color: string;
  }[];
}

export default function PieChart({ data }: PieChartProps) {
  const valueFormatter = (item: any) => `${item.value}`;

  return (
    <div className="flex justify-center items-center p-4">
      <MUIPieChart
        series={[
          {
            type: "pie",
            data,
            highlightScope: { fade: "global", highlight: "item" },
            faded: { innerRadius: 40, additionalRadius: -10, color: "gray" },
            valueFormatter,
            arcLabelMinAngle: 20,
          },
        ]}
        height={200}
        width={200}
      />
    </div>
  );
}
