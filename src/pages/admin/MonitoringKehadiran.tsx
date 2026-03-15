import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MONITORING_DATA = [
  { name: "Andi Pratama", masuk: "07:55", pulang: "16:05", status: "hadir" },
  { name: "Dewi Lestari", masuk: "08:15", pulang: "-", status: "terlambat" },
  { name: "Budi Cahyo", masuk: "07:50", pulang: "16:10", status: "hadir" },
  { name: "Rina Sari", masuk: "-", pulang: "-", status: "cuti" },
  { name: "Fajar Nugroho", masuk: "08:30", pulang: "-", status: "terlambat" },
  { name: "Maya Putri", masuk: "08:00", pulang: "-", status: "hadir" },
];

const statusColor: Record<string, string> = {
  hadir: "bg-success/10 text-success border-success/20",
  terlambat: "bg-warning/10 text-warning border-warning/20",
  cuti: "bg-primary/10 text-primary border-primary/20",
  absen: "bg-destructive/10 text-destructive border-destructive/20",
};

const MonitoringKehadiran = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-foreground">Monitoring Kehadiran</h1>

      <Select defaultValue="today">
        <SelectTrigger>
          <SelectValue placeholder="Pilih periode" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Hari Ini</SelectItem>
          <SelectItem value="week">Minggu Ini</SelectItem>
          <SelectItem value="month">Bulan Ini</SelectItem>
        </SelectContent>
      </Select>

      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          { label: "Hadir", val: 38, color: "text-success" },
          { label: "Terlambat", val: 4, color: "text-warning" },
          { label: "Cuti", val: 2, color: "text-primary" },
          { label: "Absen", val: 1, color: "text-destructive" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-3">
              <p className={`text-xl font-bold ${s.color}`}>{s.val}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-2">
        {MONITORING_DATA.map((emp, i) => (
          <Card key={i}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-semibold text-foreground">{emp.name}</p>
                <p className="text-xs text-muted-foreground">Masuk: {emp.masuk} | Pulang: {emp.pulang}</p>
              </div>
              <Badge variant="outline" className={statusColor[emp.status]}>
                {emp.status.charAt(0).toUpperCase() + emp.status.slice(1)}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MonitoringKehadiran;
