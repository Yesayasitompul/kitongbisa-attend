import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const REPORT_DATA = [
  { name: "Andi Pratama", hadir: 22, terlambat: 2, cuti: 1, absen: 0 },
  { name: "Dewi Lestari", hadir: 20, terlambat: 3, cuti: 1, absen: 1 },
  { name: "Budi Cahyo", hadir: 23, terlambat: 1, cuti: 0, absen: 1 },
  { name: "Rina Sari", hadir: 18, terlambat: 0, cuti: 5, absen: 2 },
  { name: "Fajar Nugroho", hadir: 21, terlambat: 4, cuti: 0, absen: 0 },
  { name: "Maya Putri", hadir: 22, terlambat: 1, cuti: 2, absen: 0 },
];

const LaporanAbsensi = () => {
  const { toast } = useToast();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Laporan Absensi</h1>
        <Button size="sm" variant="outline" className="gap-1" onClick={() => toast({ title: "Laporan diunduh" })}>
          <Download className="h-4 w-4" /> Unduh
        </Button>
      </div>

      <div className="flex gap-2">
        <Select defaultValue="march">
          <SelectTrigger className="flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="january">Januari 2026</SelectItem>
            <SelectItem value="february">Februari 2026</SelectItem>
            <SelectItem value="march">Maret 2026</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {REPORT_DATA.map((emp, i) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-2">
              <p className="text-sm font-semibold text-foreground">{emp.name}</p>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="rounded bg-success/10 p-2">
                  <p className="font-bold text-success">{emp.hadir}</p>
                  <p className="text-muted-foreground">Hadir</p>
                </div>
                <div className="rounded bg-warning/10 p-2">
                  <p className="font-bold text-warning">{emp.terlambat}</p>
                  <p className="text-muted-foreground">Terlambat</p>
                </div>
                <div className="rounded bg-primary/10 p-2">
                  <p className="font-bold text-primary">{emp.cuti}</p>
                  <p className="text-muted-foreground">Cuti</p>
                </div>
                <div className="rounded bg-destructive/10 p-2">
                  <p className="font-bold text-destructive">{emp.absen}</p>
                  <p className="text-muted-foreground">Absen</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LaporanAbsensi;
