import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, LogIn, LogOut, MapPin, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PegawaiDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clockedIn, setClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<string | null>(null);
  const [clockOutTime, setClockOutTime] = useState<string | null>(null);

  const now = new Date();
  const timeStr = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const handleClockIn = () => {
    const t = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setClockInTime(t);
    setClockedIn(true);
    toast({ title: "Absensi Masuk Berhasil", description: `Tercatat masuk pukul ${t}` });
  };

  const handleClockOut = () => {
    const t = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setClockOutTime(t);
    setClockedIn(false);
    toast({ title: "Absensi Pulang Berhasil", description: `Tercatat pulang pukul ${t}` });
  };

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div>
        <h1 className="text-xl font-bold text-foreground">Halo, {user?.name?.split(" ")[0]} 👋</h1>
        <p className="text-sm text-muted-foreground">{dateStr}</p>
      </div>

      {/* Clock Card */}
      <Card className="overflow-hidden border-0 bg-primary text-primary-foreground shadow-lg">
        <CardContent className="p-6 text-center space-y-3">
          <Clock className="mx-auto h-10 w-10 opacity-80" />
          <p className="text-4xl font-bold tracking-tight">{timeStr}</p>
          <div className="flex items-center justify-center gap-1 text-sm opacity-80">
            <MapPin className="h-4 w-4" />
            <span>Kantor Yayasan Kitongbisa</span>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={handleClockIn}
          disabled={!!clockInTime}
          className="h-16 flex-col gap-1 bg-success hover:bg-success/90 text-success-foreground"
        >
          <LogIn className="h-5 w-5" />
          <span className="text-xs font-medium">Absen Masuk</span>
        </Button>
        <Button
          onClick={handleClockOut}
          disabled={!clockInTime || !!clockOutTime}
          variant="outline"
          className="h-16 flex-col gap-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-xs font-medium">Absen Pulang</span>
        </Button>
      </div>

      {/* Today Status */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Status Hari Ini</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted p-3 text-center">
              <p className="text-xs text-muted-foreground">Masuk</p>
              <p className="text-lg font-bold text-foreground">{clockInTime || "--:--"}</p>
            </div>
            <div className="rounded-lg bg-muted p-3 text-center">
              <p className="text-xs text-muted-foreground">Pulang</p>
              <p className="text-lg font-bold text-foreground">{clockOutTime || "--:--"}</p>
            </div>
          </div>
          {clockInTime && (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span className="text-muted-foreground">Kehadiran tercatat</span>
              <Badge variant="secondary" className="ml-auto">Hadir</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-foreground">22</p>
            <p className="text-xs text-muted-foreground">Hadir</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-warning">2</p>
            <p className="text-xs text-muted-foreground">Terlambat</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-destructive">1</p>
            <p className="text-xs text-muted-foreground">Absen</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PegawaiDashboard;
