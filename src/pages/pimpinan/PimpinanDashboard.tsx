import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Users, TrendingUp, AlertTriangle, Award } from "lucide-react";

const PimpinanDashboard = () => {
  const { user } = useAuth();
  const now = new Date();
  const dateStr = now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const [totalPegawai, setTotalPegawai] = useState(0);
  const [kehadiranPersen, setKehadiranPersen] = useState("0%");
  const [terlambatPersen, setTerlambatPersen] = useState("0%");
  const [topPegawai, setTopPegawai] = useState<Array<{ name: string; score: number }>>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { count } = await supabase.from("pegawai").select("*", { count: "exact", head: true }).eq("status", "aktif");
      setTotalPegawai(count || 0);

      const monthStart = new Date();
      monthStart.setDate(1);
      const { data: pegawaiList } = await supabase.from("pegawai").select("id, nama").eq("status", "aktif");
      const { data: monthAbsensi } = await supabase
        .from("absensi")
        .select("pegawai_id, status")
        .gte("tanggal", monthStart.toISOString().split("T")[0]);

      if (monthAbsensi && monthAbsensi.length > 0) {
        const hadir = monthAbsensi.filter(a => a.status === "hadir" || a.status === "terlambat").length;
        const terlambat = monthAbsensi.filter(a => a.status === "terlambat").length;
        setKehadiranPersen(`${Math.round((hadir / monthAbsensi.length) * 100)}%`);
        setTerlambatPersen(`${Math.round((terlambat / monthAbsensi.length) * 100)}%`);
      }

      // Calculate discipline score per pegawai
      if (pegawaiList && monthAbsensi) {
        const scores = pegawaiList.map(p => {
          const records = monthAbsensi.filter(a => a.pegawai_id === p.id);
          if (records.length === 0) return { name: p.nama, score: 100 };
          const hadir = records.filter(r => r.status === "hadir").length;
          const total = records.length;
          return { name: p.nama, score: Math.round((hadir / total) * 100) };
        }).sort((a, b) => b.score - a.score).slice(0, 5);
        setTopPegawai(scores);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">Dashboard Pimpinan</h1>
        <p className="text-sm text-muted-foreground">{dateStr}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Total Pegawai", value: totalPegawai, icon: <Users className="h-5 w-5" />, color: "text-primary" },
          { label: "Tingkat Kehadiran", value: kehadiranPersen, icon: <TrendingUp className="h-5 w-5" />, color: "text-success" },
          { label: "Keterlambatan", value: terlambatPersen, icon: <AlertTriangle className="h-5 w-5" />, color: "text-warning" },
          { label: "Kedisiplinan", value: "Baik", icon: <Award className="h-5 w-5" />, color: "text-primary" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-start gap-3">
              <div className={s.color}>{s.icon}</div>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Top 5 Pegawai Terdisiplin</h3>
          {topPegawai.length === 0 && (
            <p className="text-sm text-muted-foreground">Belum ada data</p>
          )}
          {topPegawai.map((p, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {i + 1}
                </span>
                <span className="font-medium text-foreground">{p.name}</span>
              </div>
              <span className="text-muted-foreground">{p.score}%</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default PimpinanDashboard;
