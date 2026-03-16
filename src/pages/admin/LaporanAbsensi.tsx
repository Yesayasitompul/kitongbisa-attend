import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Download, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReportRow {
  name: string;
  hadir: number;
  terlambat: number;
  cuti: number;
  absen: number;
}

interface DailyRow {
  name: string;
  masuk: string;
  pulang: string;
  status: string;
}

const LaporanAbsensi = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [periode, setPeriode] = useState<"harian" | "bulanan">("bulanan");
  const [bulan, setBulan] = useState("3"); // March
  const [reportData, setReportData] = useState<ReportRow[]>([]);
  const [dailyData, setDailyData] = useState<DailyRow[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (periode === "bulanan") {
        const year = new Date().getFullYear();
        const month = parseInt(bulan);
        const startDate = `${year}-${month.toString().padStart(2, "0")}-01`;
        const endDate = `${year}-${(month + 1).toString().padStart(2, "0")}-01`;

        const { data: pegawaiList } = await supabase.from("pegawai").select("id, nama").eq("status", "aktif");
        const { data: absensiData } = await supabase
          .from("absensi")
          .select("pegawai_id, status")
          .gte("tanggal", startDate)
          .lt("tanggal", endDate);

        if (pegawaiList) {
          const report: ReportRow[] = pegawaiList.map(p => {
            const records = absensiData?.filter(a => a.pegawai_id === p.id) || [];
            return {
              name: p.nama,
              hadir: records.filter(r => r.status === "hadir").length,
              terlambat: records.filter(r => r.status === "terlambat").length,
              cuti: records.filter(r => r.status === "cuti").length,
              absen: records.filter(r => r.status === "absen").length,
            };
          });
          setReportData(report);
        }
      } else {
        const today = new Date().toISOString().split("T")[0];
        const { data } = await supabase
          .from("absensi")
          .select("jam_masuk, jam_pulang, status, pegawai(nama)")
          .eq("tanggal", today);

        if (data) {
          setDailyData(data.map(d => ({
            name: (d.pegawai as any)?.nama || "Unknown",
            masuk: d.jam_masuk ? d.jam_masuk.substring(0, 5) : "-",
            pulang: d.jam_pulang ? d.jam_pulang.substring(0, 5) : "-",
            status: d.status.charAt(0).toUpperCase() + d.status.slice(1),
          })));
        }
      }
    };
    fetchData();
  }, [periode, bulan]);

  const handleCetakPDF = async () => {
    toast({ title: "Generating PDF...", description: "Laporan sedang dibuat dalam format PDF." });

    // Save laporan record to DB
    await supabase.from("laporan").insert([{
      periode: periode === "harian" ? "Harian" : `Bulanan - Bulan ${bulan}`,
      dibuat_oleh: user?.id,
      data: (periode === "bulanan" ? reportData : dailyData) as any,
    }]);

    setTimeout(() => {
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
                  <thead><tr><th>Nama</th><th>Hadir</th><th>Terlambat</th><th>Cuti</th><th>Absen</th></tr></thead>
                  <tbody>${reportData.map(e => `<tr><td>${e.name}</td><td>${e.hadir}</td><td>${e.terlambat}</td><td>${e.cuti}</td><td>${e.absen}</td></tr>`).join("")}</tbody>
                </table>
              ` : `
                <table>
                  <thead><tr><th>Nama</th><th>Masuk</th><th>Pulang</th><th>Status</th></tr></thead>
                  <tbody>${dailyData.map(e => `<tr><td>${e.name}</td><td>${e.masuk}</td><td>${e.pulang}</td><td>${e.status}</td></tr>`).join("")}</tbody>
                </table>
              `}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
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

      <div className="flex gap-2">
        <Select value={periode} onValueChange={(v) => setPeriode(v as "harian" | "bulanan")}>
          <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="harian">Harian</SelectItem>
            <SelectItem value="bulanan">Bulanan</SelectItem>
          </SelectContent>
        </Select>
        {periode === "bulanan" && (
          <Select value={bulan} onValueChange={setBulan}>
            <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Januari 2026</SelectItem>
              <SelectItem value="2">Februari 2026</SelectItem>
              <SelectItem value="3">Maret 2026</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      <div id="laporan-content" className="space-y-2">
        {periode === "bulanan" ? (
          reportData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Belum ada data</p>
          ) : (
            reportData.map((emp, i) => (
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
          )
        ) : (
          dailyData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Belum ada data hari ini</p>
          ) : (
            dailyData.map((emp, i) => (
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
          )
        )}
      </div>

      <Button className="w-full gap-2" variant="outline" onClick={handleCetakPDF}>
        <Download className="h-4 w-4" />
        Generate & Unduh Laporan PDF
      </Button>
    </div>
  );
};

export default LaporanAbsensi;
