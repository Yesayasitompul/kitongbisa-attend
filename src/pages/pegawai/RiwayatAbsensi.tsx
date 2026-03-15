import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const MOCK_HISTORY = [
  { date: "2026-03-14", day: "Sabtu", masuk: "07:55", pulang: "16:05", status: "hadir" },
  { date: "2026-03-13", day: "Jumat", masuk: "08:15", pulang: "16:00", status: "terlambat" },
  { date: "2026-03-12", day: "Kamis", masuk: "07:50", pulang: "16:10", status: "hadir" },
  { date: "2026-03-11", day: "Rabu", masuk: "--:--", pulang: "--:--", status: "cuti" },
  { date: "2026-03-10", day: "Selasa", masuk: "07:58", pulang: "16:02", status: "hadir" },
  { date: "2026-03-09", day: "Senin", masuk: "07:45", pulang: "16:00", status: "hadir" },
  { date: "2026-03-07", day: "Sabtu", masuk: "--:--", pulang: "--:--", status: "absen" },
  { date: "2026-03-06", day: "Jumat", masuk: "08:00", pulang: "16:00", status: "hadir" },
];

const statusColor: Record<string, string> = {
  hadir: "bg-success/10 text-success border-success/20",
  terlambat: "bg-warning/10 text-warning border-warning/20",
  cuti: "bg-primary/10 text-primary border-primary/20",
  absen: "bg-destructive/10 text-destructive border-destructive/20",
};

const RiwayatAbsensi = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-foreground">Riwayat Absensi</h1>
      <div className="space-y-2">
        {MOCK_HISTORY.map((item) => (
          <Card key={item.date}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-semibold text-foreground">{item.day}, {new Date(item.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</p>
                <p className="text-xs text-muted-foreground">{item.masuk} — {item.pulang}</p>
              </div>
              <Badge variant="outline" className={statusColor[item.status]}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RiwayatAbsensi;
