import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RecapRow {
  name: string;
  hadir: number;
  terlambat: number;
  absen: number;
  score: number;
}

const scoreColor = (s: number) => s >= 90 ? "text-success" : s >= 75 ? "text-warning" : "text-destructive";

const RekapKedisiplinan = () => {
  const [recap, setRecap] = useState<RecapRow[]>([]);
  const [bulan, setBulan] = useState("3");

  useEffect(() => {
    const fetchData = async () => {
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
        const rows: RecapRow[] = pegawaiList.map(p => {
          const records = absensiData?.filter(a => a.pegawai_id === p.id) || [];
          const hadir = records.filter(r => r.status === "hadir").length;
          const terlambat = records.filter(r => r.status === "terlambat").length;
          const absen = records.filter(r => r.status === "absen").length;
          const total = records.length || 1;
          const score = Math.round((hadir / total) * 100);
          return { name: p.nama, hadir, terlambat, absen, score };
        }).sort((a, b) => b.score - a.score);
        setRecap(rows);
      }
    };
    fetchData();
  }, [bulan]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-foreground">Rekap Kedisiplinan</h1>

      <Select value={bulan} onValueChange={setBulan}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="1">Januari 2026</SelectItem>
          <SelectItem value="2">Februari 2026</SelectItem>
          <SelectItem value="3">Maret 2026</SelectItem>
        </SelectContent>
      </Select>

      <div className="space-y-2">
        {recap.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">Belum ada data</p>
        )}
        {recap.map((emp, i) => (
          <Card key={i}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{emp.name}</p>
                  <p className="text-xs text-muted-foreground">
                    H:{emp.hadir} T:{emp.terlambat} A:{emp.absen}
                  </p>
                </div>
              </div>
              <span className={`text-lg font-bold ${scoreColor(emp.score)}`}>{emp.score}%</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RekapKedisiplinan;
