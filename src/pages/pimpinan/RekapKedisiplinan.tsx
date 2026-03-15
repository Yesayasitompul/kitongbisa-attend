import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const RECAP = [
  { name: "Andi Pratama", hadir: 22, terlambat: 2, absen: 1, score: 95 },
  { name: "Dewi Lestari", hadir: 20, terlambat: 3, absen: 2, score: 88 },
  { name: "Budi Cahyo", hadir: 23, terlambat: 1, absen: 1, score: 98 },
  { name: "Rina Sari", hadir: 18, terlambat: 0, absen: 7, score: 72 },
  { name: "Fajar Nugroho", hadir: 21, terlambat: 4, absen: 0, score: 90 },
  { name: "Maya Putri", hadir: 22, terlambat: 1, absen: 2, score: 94 },
];

const scoreColor = (s: number) => s >= 90 ? "text-success" : s >= 75 ? "text-warning" : "text-destructive";

const RekapKedisiplinan = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-foreground">Rekap Kedisiplinan</h1>

      <Select defaultValue="march">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="january">Januari 2026</SelectItem>
          <SelectItem value="february">Februari 2026</SelectItem>
          <SelectItem value="march">Maret 2026</SelectItem>
        </SelectContent>
      </Select>

      <div className="space-y-2">
        {RECAP.sort((a, b) => b.score - a.score).map((emp, i) => (
          <Card key={i}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{emp.name}</p>
                  <p className="text-xs text-muted-foreground">
                    H:{emp.hadir} T:{emp.terlambat} A:{emp.absen}
                  </p>
                </div>
              </div>
              <span className={`text-lg font-bold ${scoreColor(emp.score)}`}>{emp.score}%</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RekapKedisiplinan;
