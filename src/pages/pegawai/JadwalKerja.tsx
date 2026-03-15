import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays } from "lucide-react";

const SCHEDULE = [
  { day: "Senin", shift: "Pagi", jam: "08:00 - 16:00", active: true },
  { day: "Selasa", shift: "Pagi", jam: "08:00 - 16:00", active: true },
  { day: "Rabu", shift: "Pagi", jam: "08:00 - 16:00", active: true },
  { day: "Kamis", shift: "Pagi", jam: "08:00 - 16:00", active: true },
  { day: "Jumat", shift: "Pagi", jam: "08:00 - 16:00", active: true },
  { day: "Sabtu", shift: "Libur", jam: "-", active: false },
  { day: "Minggu", shift: "Libur", jam: "-", active: false },
];

const JadwalKerja = () => {
  const today = new Date().toLocaleDateString("id-ID", { weekday: "long" });

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
        {SCHEDULE.map((item) => (
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
