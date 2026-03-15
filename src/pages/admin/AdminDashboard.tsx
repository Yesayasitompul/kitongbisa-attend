import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Clock, AlertTriangle, CheckCircle2, UserPlus, FileText } from "lucide-react";

const AdminDashboard = () => {
  const { user } = useAuth();
  const now = new Date();
  const dateStr = now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const stats = [
    { label: "Total Pegawai", value: 45, icon: <Users className="h-5 w-5" />, color: "text-primary" },
    { label: "Hadir Hari Ini", value: 38, icon: <CheckCircle2 className="h-5 w-5" />, color: "text-success" },
    { label: "Terlambat", value: 4, icon: <Clock className="h-5 w-5" />, color: "text-warning" },
    { label: "Tidak Hadir", value: 3, icon: <AlertTriangle className="h-5 w-5" />, color: "text-destructive" },
  ];

  const recentActivity = [
    { name: "Andi Pratama", action: "Absen Masuk", time: "07:55", status: "tepat" },
    { name: "Dewi Lestari", action: "Absen Masuk", time: "08:15", status: "terlambat" },
    { name: "Budi Cahyo", action: "Absen Masuk", time: "07:50", status: "tepat" },
    { name: "Rina Sari", action: "Pengajuan Cuti", time: "09:00", status: "pending" },
    { name: "Fajar Nugroho", action: "Absen Masuk", time: "08:30", status: "terlambat" },
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
