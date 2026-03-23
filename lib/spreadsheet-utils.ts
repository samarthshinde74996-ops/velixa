export interface SheetColumn {
  header: string;
  type: "text" | "number" | "formula" | "date" | "currency" | "percentage";
  width?: number;
  formula?: string;
  format?: string;
}

export interface SheetData {
  name: string;
  columns: SheetColumn[];
  rows: number;
  sampleData: (string | number)[][];
  formatting?: {
    headerBg?: string;
    alternateRows?: boolean;
    currency?: string;
  };
}

export function resolveFormula(
  formula: string,
  rowIndex: number,
  rowData: (string | number)[]
): string {
  let f = formula.replace(/\{row\}/g, String(rowIndex));
  f = f.replace(/([A-Z])(\d+)/g, (_match, col) => {
    const colIdx = col.charCodeAt(0) - 65;
    const val = rowData[colIdx];
    return val !== undefined && val !== "" ? String(val) : "0";
  });
  try {
    const expr = f.startsWith("=") ? f.slice(1) : f;
    // eslint-disable-next-line no-new-func
    const result = new Function(`return (${expr})`)();
    if (typeof result === "number") {
      return "₹" + Number(result.toFixed(2)).toLocaleString("en-IN");
    }
    return String(result);
  } catch {
    return "ERR";
  }
}

export function exportToCSV(data: SheetData): void {
  const headers = data.columns.map((c) => `"${c.header}"`).join(",");
  const rows = data.sampleData
    .map((row, ri) =>
      data.columns
        .map((col, ci) => {
          if (col.type === "formula" && col.formula) {
            return `"${resolveFormula(col.formula, ri + 2, row)}"`;
          }
          return `"${row[ci] ?? ""}"`;
        })
        .join(",")
    )
    .join("\n");
  const blob = new Blob([`${headers}\n${rows}`], { type: "text/csv" });
  downloadBlob(blob, `${data.name.replace(/\s+/g, "_")}.csv`);
}

export async function exportToXLSX(data: SheetData): Promise<void> {
  const XLSX = await import("xlsx");
  const headerRow = data.columns.map((c) => c.header);
  const dataRows = data.sampleData.map((row, ri) =>
    data.columns.map((col, ci) => {
      if (col.type === "formula" && col.formula) {
        return resolveFormula(col.formula, ri + 2, row);
      }
      return row[ci] ?? "";
    })
  );
  const ws = XLSX.utils.aoa_to_sheet([headerRow, ...dataRows]);
  ws["!cols"] = data.columns.map((c) => ({ wch: Math.round((c.width ?? 120) / 7) }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, data.name);
  XLSX.writeFile(wb, `${data.name.replace(/\s+/g, "_")}.xlsx`);
}

export function exportToPDF(data: SheetData): void {
  const headerRow = data.columns.map((c) => `<th>${c.header}</th>`).join("");
  const dataRows = data.sampleData
    .map((row, ri) => {
      const cells = data.columns
        .map((col, ci) => {
          const val =
            col.type === "formula" && col.formula
              ? resolveFormula(col.formula, ri + 2, row)
              : String(row[ci] ?? "");
          return `<td>${val}</td>`;
        })
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${data.name}</title>
<style>body{font-family:Arial,sans-serif;font-size:12px;margin:20px}h1{font-size:18px;margin-bottom:12px}
table{border-collapse:collapse;width:100%}th{background:#1a1a24;color:white;padding:8px;text-align:left;font-size:11px}
td{padding:6px 8px;border:1px solid #e0e0e0}tr:nth-child(even)td{background:#f9f9f9}</style>
</head><body><h1>${data.name}</h1>
<table><thead><tr>${headerRow}</tr></thead><tbody>${dataRows}</tbody></table></body></html>`;
  const w = window.open("", "_blank");
  if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 500); }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export const TEMPLATES = [
  { emoji: "💰", label: "Salary Sheet", prompt: "Create a salary sheet for 25 employees with basic salary, HRA 40%, PF 12%, tax 10%, and net pay calculation" },
  { emoji: "📊", label: "Expense Tracker", prompt: "Monthly expense tracker for a startup with categories, amounts, dates, vendor names and GST totals" },
  { emoji: "🎓", label: "Attendance Sheet", prompt: "Student attendance sheet for 30 students with daily attendance, present days, absent days, and attendance percentage" },
  { emoji: "🧾", label: "Invoice Template", prompt: "Freelancer invoice template with item description, quantity, unit price, GST 18%, and grand total" },
  { emoji: "📦", label: "Inventory Tracker", prompt: "Product inventory tracker with SKU, item name, quantity, reorder level, unit cost, total value, and low stock alert" },
  { emoji: "🇮🇳", label: "ITR Filing", prompt: "ITR income tax return filing sheet with salary income, house rent allowance, deductions under 80C, 80D, taxable income, and tax payable calculation for India" },
  { emoji: "📒", label: "Tally Export", prompt: "Tally accounting export format with voucher date, ledger name, debit amount, credit amount, narration, voucher type for Indian accounting" },
  { emoji: "🏭", label: "MSME GST Sheet", prompt: "MSME small business GST sheet with invoice number, party name, GSTIN, taxable amount, CGST 9%, SGST 9%, IGST, and total invoice value" },
  { emoji: "📝", label: "Report Card", prompt: "School student report card for 40 students with 6 subjects marks out of 100, total marks, percentage, grade A B C D F, and pass fail status" },
  { emoji: "🏏", label: "Cricket Scorecard", prompt: "Cricket match scorecard with batsman name, runs scored, balls faced, fours, sixes, strike rate, and bowling figures with overs wickets runs economy" },
];

export const PLANS = [
  {
    name: "Free",
    price: 0,
    priceLabel: "₹0 / month",
    features: ["5 sheets per month", "Export to CSV", "5 templates", "Basic formulas"],
    limit: 5,
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: 299,
    priceLabel: "₹299 / month",
    features: ["Unlimited sheets", "Export XLSX + CSV + PDF", "All templates", "Advanced formulas", "Sheet history", "Priority support"],
    limit: -1,
    cta: "Upgrade to Pro",
    highlighted: true,
  },
  {
    name: "Team",
    price: 799,
    priceLabel: "₹799 / month",
    features: ["Everything in Pro", "5 team members", "Shared workspace", "API access", "Custom templates", "Dedicated support"],
    limit: -1,
    cta: "Start Team Plan",
    highlighted: false,
  },
];
