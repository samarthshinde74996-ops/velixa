"use client";
import { useEffect, useRef, useState } from "react";
import { SheetData } from "@/lib/spreadsheet-utils";

interface Props { data: SheetData; }

export default function SheetChart({ data }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [chartType, setChartType] = useState<"bar" | "pie" | "line">("bar");
  const [visible, setVisible] = useState(true);
  const chartRef = useRef<any>(null);

  // Find best columns for chart
  const labelCol = data.columns.findIndex((c) => c.type === "text");
  const valueCol = data.columns.findIndex((c) => c.type === "currency" || c.type === "number" || c.type === "formula");

  useEffect(() => {
    if (!canvasRef.current || labelCol === -1 || valueCol === -1) return;

    const loadChart = async () => {
      const Chart = (await import("chart.js/auto")).default;

      if (chartRef.current) chartRef.current.destroy();

      const labels = data.sampleData.slice(0, 10).map((row) => String(row[labelCol] || ""));
      const values = data.sampleData.slice(0, 10).map((row, ri) => {
        const col = data.columns[valueCol];
        if (col.type === "formula" && col.formula) {
          const expr = col.formula.replace(/\{row\}/g, String(ri + 2)).replace(/([A-Z])(\d+)/g, (_, c) => String(row[c.charCodeAt(0) - 65] || 0));
          try { return new Function(`return (${expr.slice(1)})`)(); } catch { return 0; }
        }
        return Number(row[valueCol]) || 0;
      });

      const colors = ["#6c63ff", "#00d4aa", "#f97316", "#0ea5e9", "#a855f7", "#22c55e", "#fbbf24", "#ef4444", "#06b6d4", "#ec4899"];

      chartRef.current = new Chart(canvasRef.current!, {
        type: chartType,
        data: {
          labels,
          datasets: [{
            label: data.columns[valueCol]?.header ?? "Value",
            data: values,
            backgroundColor: chartType === "bar" ? colors.map((c) => c + "cc") : colors,
            borderColor: chartType === "line" ? "#6c63ff" : colors,
            borderWidth: chartType === "line" ? 2 : 1,
            fill: chartType === "line",
            tension: 0.4,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: "#a0a0c0", font: { family: "JetBrains Mono", size: 11 } } },
          },
          scales: chartType !== "pie" ? {
            x: { ticks: { color: "#7a7a9a", font: { size: 10 } }, grid: { color: "rgba(42,42,58,0.5)" } },
            y: { ticks: { color: "#7a7a9a", font: { size: 10 } }, grid: { color: "rgba(42,42,58,0.5)" } },
          } : undefined,
        },
      });
    };

    loadChart();
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [data, chartType, labelCol, valueCol]);

  if (labelCol === -1 || valueCol === -1) return null;

  return (
    <div className="border-t border-[#2a2a3a] bg-[#0d0d14]">
      <div className="flex items-center justify-between px-4 py-2 bg-[#111118] border-b border-[#2a2a3a]">
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-[#7a7a9a] font-mono">Auto Chart</span>
          <span className="badge badge-accent text-[9px]">AI</span>
        </div>
        <div className="flex items-center gap-2">
          {(["bar", "line", "pie"] as const).map((t) => (
            <button key={t} onClick={() => setChartType(t)}
              className={`text-[11px] px-2.5 py-1 rounded-lg font-mono transition-all ${chartType === t ? "bg-[#6c63ff] text-white" : "text-[#7a7a9a] hover:text-white"}`}>
              {t === "bar" ? "📊" : t === "line" ? "📈" : "🥧"} {t}
            </button>
          ))}
          <button onClick={() => setVisible(!visible)}
            className="text-[11px] text-[#7a7a9a] hover:text-white font-mono ml-2">
            {visible ? "▲ Hide" : "▼ Show"}
          </button>
        </div>
      </div>

      {visible && (
        <div className="p-4" style={{ height: 250 }}>
          <canvas ref={canvasRef} />
        </div>
      )}
    </div>
  );
}