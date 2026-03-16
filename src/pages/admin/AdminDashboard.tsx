import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

const AdminDashboard = () => {
  const { user } = useAuth();
  const now = new Date();
  const dateStr = now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const today = now.toISOString().split("T")[0];

  const [totalPegawai, setTotalPegawai] = useState(0);
  const [todayStats, setTodayStats] = useState({ hadir: 0, terlambat: 0, absen: 0 });
  const [recentActivity, setRecentActivity] = useState<Array<{ name: string; action: string; time: string; status: string }>>([]);

  useEffect(() => {
    const fetchData = async () => {
      // Total pegawai
      const { count } = await supabase.from("pegawai").select("*", { count: "exact", head: true });
      setTotalPegawai(count || 0);

      // Today's attendance
      const { data: absensiToday } = await supabase
        .from("absensi")
        .select("*, pegawai(nama)")
        .eq("tanggal", today);

      if (absensiToday) {
        setTodayStats({
          hadir: absensiToday.filter(a => a.status === "hadir").length,
          terlambat: absensiToday.filter(a => a.status === "terlambat").length,
          absen: (count || 0) - absensiToday.length,
        });

        setRecentActivity(
          absensiToday.slice(0, 5).map(a => ({
            name: (a.pegawai as any)?.nama || "Unknown",
            action: "Absen Masuk",
            time: a.jam_masuk ? a.jam_masuk.substring(0, 5) : "-",
            status: a.status === "hadir" ? "tepat" : a.status === "terlambat" ? "terlambat" : "pending",
          }))
        );
      }
    };
    fetchData();
  }, []);

  const stats = [
    { label: "Total Pegawai", value: totalPegawai, icon: <Users className="h-5 w-5" />, color: "text-primary" },
    { label: "Hadir Hari Ini", value: todayStats.hadir, icon: <CheckCircle2 className="h-5 w-5" />, color: "text-success" },
    { label: "Terlambat", value: todayStats.terlambat, icon: <Clock className="h-5 w-5" />, color: "text-warning" },
    { label: "Tidak Hadir", value: todayStats.absen, icon: <AlertTriangle className="h-5 w-5" />, color: "text-destructive" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">Dashboard Admin</h1>
        <p className="text-sm text-muted-foreground">{dateStr}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
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
          <h3 className="text-sm font-semibold text-foreground">Aktivitas Terkini</h3>
          <div className="space-y-3">
            {recentActivity.length === 0 && (
              <p className="text-sm text-muted-foreground">Belum ada aktivitas hari ini</p>
            )}
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-foreground">{a.name}</p>
                  <p className="text-xs text-muted-foreground">{a.action} • {a.time}</p>
                </div>
                <span className={`text-xs font-medium ${
                  a.status === "tepat" ? "text-success" :
                  a.status === "terlambat" ? "text-warning" : "text-primary"
                }`}>
                  {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
