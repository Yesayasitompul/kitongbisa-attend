import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Users, TrendingUp, AlertTriangle, Award } from "lucide-react";

const PimpinanDashboard = () => {
  const { user } = useAuth();
  const now = new Date();
  const dateStr = now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">Dashboard Pimpinan</h1>
        <p className="text-sm text-muted-foreground">{dateStr}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Total Pegawai", value: 45, icon: <Users className="h-5 w-5" />, color: "text-primary" },
          { label: "Tingkat Kehadiran", value: "92%", icon: <TrendingUp className="h-5 w-5" />, color: "text-success" },
          { label: "Keterlambatan", value: "8%", icon: <AlertTriangle className="h-5 w-5" />, color: "text-warning" },
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
          {[
            { name: "Budi Cahyo", score: 98 },
            { name: "Andi Pratama", score: 95 },
            { name: "Maya Putri", score: 94 },
            { name: "Fajar Nugroho", score: 90 },
            { name: "Dewi Lestari", score: 88 },
          ].map((p, i) => (
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
