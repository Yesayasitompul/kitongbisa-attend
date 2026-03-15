import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const EMPLOYEES = [
  { name: "Andi Pratama", score: 95, status: "Sangat Baik" },
  { name: "Dewi Lestari", score: 88, status: "Baik" },
  { name: "Budi Cahyo", score: 98, status: "Sangat Baik" },
  { name: "Rina Sari", score: 72, status: "Cukup" },
  { name: "Fajar Nugroho", score: 90, status: "Sangat Baik" },
  { name: "Maya Putri", score: 94, status: "Sangat Baik" },
];

const statusVariant = (s: string) => {
  if (s === "Sangat Baik") return "bg-success/10 text-success border-success/20";
  if (s === "Baik") return "bg-primary/10 text-primary border-primary/20";
  return "bg-warning/10 text-warning border-warning/20";
};

const EvaluasiPegawai = () => {
  const { toast } = useToast();
  const [selected, setSelected] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const handleSave = () => {
    toast({ title: "Evaluasi disimpan", description: `Catatan untuk ${selected} telah disimpan.` });
    setSelected(null);
    setNote("");
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-foreground">Evaluasi Pegawai</h1>

      {selected ? (
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Evaluasi: {selected}</h3>
            <Textarea
              placeholder="Tulis catatan evaluasi..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
            />
            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1">Simpan</Button>
              <Button variant="outline" onClick={() => setSelected(null)}>Batal</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {EMPLOYEES.map((emp, i) => (
            <Card key={i} className="cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all" onClick={() => setSelected(emp.name)}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">{emp.name}</p>
                  <p className="text-xs text-muted-foreground">Skor: {emp.score}%</p>
                </div>
                <Badge variant="outline" className={statusVariant(emp.status)}>
                  {emp.status}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EvaluasiPegawai;
