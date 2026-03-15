import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const REPORT_DATA = [
  { name: "Andi Pratama", hadir: 22, terlambat: 2, cuti: 1, absen: 0 },
  { name: "Dewi Lestari", hadir: 20, terlambat: 3, cuti: 1, absen: 1 },
  { name: "Budi Cahyo", hadir: 23, terlambat: 1, cuti: 0, absen: 1 },
  { name: "Rina Sari", hadir: 18, terlambat: 0, cuti: 5, absen: 2 },
  { name: "Fajar Nugroho", hadir: 21, terlambat: 4, cuti: 0, absen: 0 },
  { name: "Maya Putri", hadir: 22, terlambat: 1, cuti: 2, absen: 0 },
];

const DAILY_DATA = [
  { name: "Andi Pratama", masuk: "07:55", pulang: "16:05", status: "Hadir" },
  { name: "Dewi Lestari", masuk: "08:15", pulang: "16:00", status: "Terlambat" },
  { name: "Budi Cahyo", masuk: "07:50", pulang: "16:10", status: "Hadir" },
  { name: "Rina Sari", masuk: "-", pulang: "-", status: "Cuti" },
  { name: "Fajar Nugroho", masuk: "08:30", pulang: "-", status: "Terlambat" },
  { name: "Maya Putri", masuk: "08:00", pulang: "16:00", status: "Hadir" },
];

const LaporanAbsensi = () => {
  const { toast } = useToast();
  const [periode, setPeriode] = useState<"harian" | "bulanan">("bulanan");
  const [bulan, setBulan] = useState("march");

  const handleCetakPDF = () => {
    // Simulate PDF generation
    toast({
      title: "Generating PDF...",
      description: "Laporan sedang dibuat dalam format PDF.",
    });

    setTimeout(() => {
      // Create printable content
      const printContent = document.getElementById("laporan-content");
      if (printContent) {
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>Laporan Absensi - Yayasan Kitongbisa</title>
                <style>
                  body { font-family: Arial, sans-serif; padding: 20px; }
                  h1 { font-size: 18px; text-align: center; }
                  h2 { font-size: 14px; color: #666; text-align: center; margin-bottom: 20px; }
                  table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
                  th { background-color: #f5f5f5; font-weight: bold; }
                </style>
              </head>
              <body>
                <h1>Laporan Absensi - Yayasan Kitongbisa</h1>
                <h2>Periode: ${periode === "harian" ? "Harian" : "Bulanan"}</h2>
                ${periode === "bulanan" ? `
                  <table>
                    <thead>
                      <tr><th>Nama</th><th>Hadir</th><th>Terlambat</th><th>Cuti</th><th>Absen</th></tr>
                    </thead>
                    <tbody>
                      ${REPORT_DATA.map(e => `<tr><td>${e.name}</td><td>${e.hadir}</td><td>${e.terlambat}</td><td>${e.cuti}</td><td>${e.absen}</td></tr>`).join("")}
                    </tbody>
                  </table>
                ` : `
                  <table>
                    <thead>
                      <tr><th>Nama</th><th>Masuk</th><th>Pulang</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      ${DAILY_DATA.map(e => `<tr><td>${e.name}</td><td>${e.masuk}</td><td>${e.pulang}</td><td>${e.status}</td></tr>`).join("")}
                    </tbody>
                  </table>
                `}
              </body>
            </html>
          `);
          printWindow.document.close();
          printWindow.print();
        }
      }
      toast({ title: "Laporan PDF siap", description: "File PDF telah di-generate." });
    }, 1000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Laporan Absensi</h1>
        <Button size="sm" variant="outline" className="gap-1" onClick={handleCetakPDF}>
          <Printer className="h-4 w-4" /> Cetak PDF
        </Button>
      </div>

      {/* Period Filter: Harian / Bulanan */}
      <div className="flex gap-2">
        <Select value={periode} onValueChange={(v) => setPeriode(v as "harian" | "bulanan")}>
          <SelectTrigger className="flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="harian">Harian</SelectItem>
            <SelectItem value="bulanan">Bulanan</SelectItem>
          </SelectContent>
        </Select>

        {periode === "bulanan" && (
          <Select value={bulan} onValueChange={setBulan}>
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="january">Januari 2026</SelectItem>
              <SelectItem value="february">Februari 2026</SelectItem>
              <SelectItem value="march">Maret 2026</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      <div id="laporan-content" className="space-y-2">
        {periode === "bulanan" ? (
          // Laporan Bulanan
          REPORT_DATA.map((emp, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-2">
                <p className="text-sm font-semibold text-foreground">{emp.name}</p>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="rounded bg-success/10 p-2">
                    <p className="font-bold text-success">{emp.hadir}</p>
                    <p className="text-muted-foreground">Hadir</p>
                  </div>
                  <div className="rounded bg-warning/10 p-2">
                    <p className="font-bold text-warning">{emp.terlambat}</p>
                    <p className="text-muted-foreground">Terlambat</p>
                  </div>
                  <div className="rounded bg-primary/10 p-2">
                    <p className="font-bold text-primary">{emp.cuti}</p>
                    <p className="text-muted-foreground">Cuti</p>
                  </div>
                  <div className="rounded bg-destructive/10 p-2">
                    <p className="font-bold text-destructive">{emp.absen}</p>
                    <p className="text-muted-foreground">Absen</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          // Laporan Harian
          DAILY_DATA.map((emp, i) => (
            <Card key={i}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">{emp.name}</p>
                  <p className="text-xs text-muted-foreground">Masuk: {emp.masuk} | Pulang: {emp.pulang}</p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    emp.status === "Hadir" ? "bg-success/10 text-success border-success/20" :
                    emp.status === "Terlambat" ? "bg-warning/10 text-warning border-warning/20" :
                    "bg-primary/10 text-primary border-primary/20"
                  }
                >
                  {emp.status}
                </Badge>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Download button */}
      <Button className="w-full gap-2" variant="outline" onClick={handleCetakPDF}>
        <Download className="h-4 w-4" />
        Generate & Unduh Laporan PDF
      </Button>
    </div>
  );
};

export default LaporanAbsensi;
