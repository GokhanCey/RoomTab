import { AgreementData } from "./types";

export function downloadAgreementCsv(agreement: AgreementData, planName: string) {
    if (!agreement || !agreement.split) return;

    // 1. Define Headers
    const headers = ["Participant", "Recommended Share", "Percentage", "Reasoning"];

    // 2. Map Rows
    const rows = agreement.split.map(item => [
        item.name,
        item.recommendedShare.toFixed(2),
        `${item.sharePercentage}%`,
        `"${item.reasoning.replace(/"/g, '""')}"` // Escape quotes
    ]);

    // 3. Add Summary Footer
    rows.push([]);
    rows.push(["TOTAL", agreement.totalAmount.toFixed(2), "100%", ""]);
    rows.push(["Agent Summary", `"${agreement.agentSummary.replace(/"/g, '""')}"`]);

    // 4. Construct CSV String
    const csvContent = [
        headers.join(","),
        ...rows.map(e => e.join(","))
    ].join("\n");

    // 5. Trigger Download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${planName.replace(/\s+/g, '_')}_split_report.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
