import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const statusColor: Record<string, string> = {
  hadir: "bg-success/10 text-success border-success/20",
  terlambat: "bg-warning/10 text-warning border-warning/20",
  cuti: "bg-primary/10 text-primary border-primary/20",
  absen: "bg-destructive/10 text-destructive border-destructive/20",
};

interface AbsensiRow {
  tanggal: string;
  jam_masuk: string | null;
  jam_pulang: string | null;
  status: string;
}

const RiwayatAbsensi = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<AbsensiRow[]>([]);

  useEffect(() => {
    if (!user?.pegawaiId) return;
    const fetchHistory = async () => {
      const { data } = await supabase
        .from("absensi")
        .select("tanggal, jam_masuk, jam_pulang, status")
        .eq("pegawai_id", user.pegawaiId!)
        .order("tanggal", { ascending: false })
        .limit(30);
      if (data) setHistory(data);
    };
    fetchHistory();
  }, [user?.pegawaiId]);

  const formatTime = (t: string | null) => t ? t.substring(0, 5) : "--:--";

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-foreground">Riwayat Absensi</h1>
      <div className="space-y-2">
        {history.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">Belum ada data absensi</p>
        )}
        {history.map((item) => {
          const d = new Date(item.tanggal);
          const dayStr = d.toLocaleDateString("id-ID", { weekday: "long" });
          const dateStr = d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
          return (
            <Card key={item.tanggal}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">{dayStr}, {dateStr}</p>
                  <p className="text-xs text-muted-foreground">{formatTime(item.jam_masuk)} — {formatTime(item.jam_pulang)}</p>
                </div>
                <Badge variant="outline" className={statusColor[item.status] || ""}>
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default RiwayatAbsensi;
