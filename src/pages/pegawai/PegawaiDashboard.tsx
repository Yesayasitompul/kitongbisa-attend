import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, LogIn, LogOut, MapPin, CheckCircle2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const LOKASI = "Kantor Yayasan Kitongbisa";

const PegawaiDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [todayAbsensi, setTodayAbsensi] = useState<{ jam_masuk: string | null; jam_pulang: string | null; status: string } | null>(null);
  const [jadwal, setJadwal] = useState<{ jam_masuk: string; jam_pulang: string } | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState({ hadir: 0, terlambat: 0, absen: 0 });

  // Live clock
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch today's absensi and jadwal
  useEffect(() => {
    if (!user?.pegawaiId) return;
    
    const fetchData = async () => {
      const today = new Date().toISOString().split("T")[0];
      
      // Get today's absensi
      const { data: absensiData } = await supabase
        .from("absensi")
        .select("*")
        .eq("pegawai_id", user.pegawaiId!)
        .eq("tanggal", today)
        .maybeSingle();
      
      if (absensiData) {
        setTodayAbsensi(absensiData);
      }

      // Get jadwal for today
      const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
      const todayName = dayNames[new Date().getDay()];
      const { data: jadwalData } = await supabase
        .from("jadwal")
        .select("*")
        .eq("pegawai_id", user.pegawaiId!)
        .eq("hari_kerja", todayName)
        .maybeSingle();
      
      if (jadwalData) {
        setJadwal({ jam_masuk: jadwalData.jam_masuk, jam_pulang: jadwalData.jam_pulang });
      } else {
        setJadwal({ jam_masuk: "08:00", jam_pulang: "16:00" });
      }

      // Get monthly stats
      const monthStart = new Date();
      monthStart.setDate(1);
      const { data: monthData } = await supabase
        .from("absensi")
        .select("status")
        .eq("pegawai_id", user.pegawaiId!)
        .gte("tanggal", monthStart.toISOString().split("T")[0]);
      
      if (monthData) {
        setStats({
          hadir: monthData.filter(a => a.status === "hadir").length,
          terlambat: monthData.filter(a => a.status === "terlambat").length,
          absen: monthData.filter(a => a.status === "absen").length,
        });
      }
    };

    fetchData();
  }, [user?.pegawaiId]);

  const timeStr = currentTime.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const dateStr = currentTime.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const jamMasukJadwal = jadwal?.jam_masuk || "08:00";
  const jamPulangJadwal = jadwal?.jam_pulang || "16:00";

  const checkTerlambat = (time: Date): boolean => {
    const [jam, menit] = jamMasukJadwal.split(":").map(Number);
    const batasMasuk = new Date(time);
    batasMasuk.setHours(jam, menit, 0, 0);
    return time > batasMasuk;
  };

  const handleClockIn = async () => {
    if (!user?.pegawaiId) return;
    const now = new Date();
    const timeNow = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const isTerlambat = checkTerlambat(now);
    const today = now.toISOString().split("T")[0];
    const jamMasukDb = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;

    const { error } = await supabase.from("absensi").upsert({
      pegawai_id: user.pegawaiId,
      tanggal: today,
      jam_masuk: jamMasukDb,
      status: isTerlambat ? "terlambat" : "hadir",
    }, { onConflict: "pegawai_id,tanggal" });

    if (error) {
      toast({ title: "Gagal mencatat absensi", description: error.message, variant: "destructive" });
      return;
    }

    setTodayAbsensi({ jam_masuk: jamMasukDb, jam_pulang: null, status: isTerlambat ? "terlambat" : "hadir" });

    if (isTerlambat) {
      toast({
        title: "Absensi Masuk - Terlambat",
        description: `Tercatat masuk pukul ${timeNow}. Anda terlambat dari jadwal ${jamMasukJadwal}. Notifikasi telah dikirim ke HR.`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Absensi Masuk Berhasil",
        description: `Tercatat masuk pukul ${timeNow}. Status: Hadir tepat waktu.`,
      });
    }
  };

  const handleClockOut = async () => {
    if (!user?.pegawaiId) return;
    const now = new Date();
    const timeNow = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const today = now.toISOString().split("T")[0];
    const jamPulangDb = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;

    const { error } = await supabase
      .from("absensi")
      .update({ jam_pulang: jamPulangDb })
      .eq("pegawai_id", user.pegawaiId)
      .eq("tanggal", today);

    if (error) {
      toast({ title: "Gagal mencatat pulang", description: error.message, variant: "destructive" });
      return;
    }

    setTodayAbsensi(prev => prev ? { ...prev, jam_pulang: jamPulangDb } : null);
    toast({ title: "Absensi Pulang Berhasil", description: `Tercatat pulang pukul ${timeNow}. Data absensi telah disimpan.` });
  };

  const formatTime = (t: string | null) => t ? t.substring(0, 5) : "--:--";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">Halo, {user?.name?.split(" ")[0]} 👋</h1>
        <p className="text-sm text-muted-foreground">{dateStr}</p>
      </div>

      <Card className="overflow-hidden border-0 bg-primary text-primary-foreground shadow-lg">
        <CardContent className="p-6 text-center space-y-3">
          <Clock className="mx-auto h-10 w-10 opacity-80" />
          <p className="text-4xl font-bold tracking-tight">{timeStr}</p>
          <div className="flex items-center justify-center gap-1 text-sm opacity-80">
            <MapPin className="h-4 w-4" />
            <span>{LOKASI}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-2">Jadwal Kerja Hari Ini</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted p-3 text-center">
              <p className="text-xs text-muted-foreground">Jam Masuk</p>
              <p className="text-lg font-bold text-foreground">{jamMasukJadwal}</p>
            </div>
            <div className="rounded-lg bg-muted p-3 text-center">
              <p className="text-xs text-muted-foreground">Jam Pulang</p>
              <p className="text-lg font-bold text-foreground">{jamPulangJadwal}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={handleClockIn}
          disabled={!!todayAbsensi?.jam_masuk}
          className="h-16 flex-col gap-1 bg-success hover:bg-success/90 text-success-foreground"
        >
          <LogIn className="h-5 w-5" />
          <span className="text-xs font-medium">Absen Masuk</span>
        </Button>
        <Button
          onClick={handleClockOut}
          disabled={!todayAbsensi?.jam_masuk || !!todayAbsensi?.jam_pulang}
          variant="outline"
          className="h-16 flex-col gap-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-xs font-medium">Absen Pulang</span>
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Status Hari Ini</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted p-3 text-center">
              <p className="text-xs text-muted-foreground">Masuk</p>
              <p className="text-lg font-bold text-foreground">{formatTime(todayAbsensi?.jam_masuk || null)}</p>
            </div>
            <div className="rounded-lg bg-muted p-3 text-center">
              <p className="text-xs text-muted-foreground">Pulang</p>
              <p className="text-lg font-bold text-foreground">{formatTime(todayAbsensi?.jam_pulang || null)}</p>
            </div>
          </div>
          {todayAbsensi?.jam_masuk && (
            <div className="flex items-center gap-2 text-sm">
              {todayAbsensi.status === "terlambat" ? (
                <>
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <span className="text-muted-foreground">Terlambat - Notifikasi dikirim ke HR</span>
                  <Badge variant="outline" className="ml-auto bg-warning/10 text-warning border-warning/20">Terlambat</Badge>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span className="text-muted-foreground">Kehadiran tercatat</span>
                  <Badge variant="secondary" className="ml-auto">Hadir</Badge>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{stats.hadir}</p>
            <p className="text-xs text-muted-foreground">Hadir</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-warning">{stats.terlambat}</p>
            <p className="text-xs text-muted-foreground">Terlambat</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-destructive">{stats.absen}</p>
            <p className="text-xs text-muted-foreground">Absen</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PegawaiDashboard;
