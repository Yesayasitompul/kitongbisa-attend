import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays } from "lucide-react";

const HARI = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

interface JadwalRow {
  hari_kerja: string;
  jam_masuk: string;
  jam_pulang: string;
}

const JadwalKerja = () => {
  const { user } = useAuth();
  const [jadwalList, setJadwalList] = useState<JadwalRow[]>([]);
  const today = new Date().toLocaleDateString("id-ID", { weekday: "long" });

  useEffect(() => {
    if (!user?.pegawaiId) return;
    const fetchJadwal = async () => {
      const { data } = await supabase
        .from("jadwal")
        .select("hari_kerja, jam_masuk, jam_pulang")
        .eq("pegawai_id", user.pegawaiId!);
      if (data && data.length > 0) {
        setJadwalList(data);
      } else {
        // Default schedule if none set
        setJadwalList(
          HARI.map(h => ({
            hari_kerja: h,
            jam_masuk: h === "Sabtu" || h === "Minggu" ? "-" : "08:00",
            jam_pulang: h === "Sabtu" || h === "Minggu" ? "-" : "16:00",
          }))
        );
      }
    };
    fetchJadwal();
  }, [user?.pegawaiId]);

  const schedule = HARI.map(h => {
    const found = jadwalList.find(j => j.hari_kerja === h);
    const active = found ? found.jam_masuk !== "-" : false;
    return {
      day: h,
      shift: active ? "Pagi" : "Libur",
      jam: active ? `${found!.jam_masuk.substring(0,5)} - ${found!.jam_pulang.substring(0,5)}` : "-",
      active,
    };
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-foreground">Jadwal Kerja</h1>
      <Card className="border-0 bg-primary text-primary-foreground">
        <CardContent className="flex items-center gap-3 p-4">
          <CalendarDays className="h-8 w-8 opacity-80" />
          <div>
            <p className="text-sm font-medium opacity-80">Minggu ini</p>
            <p className="text-lg font-bold">Shift Pagi — 08:00 - 16:00</p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {schedule.map((item) => (
          <Card key={item.day} className={today === item.day ? "ring-2 ring-primary" : ""}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {item.day}
                  {today === item.day && <span className="ml-2 text-xs text-primary">(Hari ini)</span>}
                </p>
                <p className="text-xs text-muted-foreground">{item.jam}</p>
              </div>
              <Badge variant={item.active ? "default" : "secondary"}>
                {item.shift}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default JadwalKerja;
