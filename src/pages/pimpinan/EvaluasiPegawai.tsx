import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface EmpEval {
  pegawai_id: string;
  name: string;
  score: number;
  status: string;
}

const statusVariant = (s: string) => {
  if (s === "Sangat Baik") return "bg-success/10 text-success border-success/20";
  if (s === "Baik") return "bg-primary/10 text-primary border-primary/20";
  return "bg-warning/10 text-warning border-warning/20";
};

const getStatus = (score: number) => score >= 90 ? "Sangat Baik" : score >= 75 ? "Baik" : "Cukup";

const EvaluasiPegawai = () => {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<EmpEval[]>([]);
  const [selected, setSelected] = useState<EmpEval | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const monthStart = new Date();
      monthStart.setDate(1);

      const { data: pegawaiList } = await supabase.from("pegawai").select("id, nama").eq("status", "aktif");
      const { data: absensiData } = await supabase
        .from("absensi")
        .select("pegawai_id, status")
        .gte("tanggal", monthStart.toISOString().split("T")[0]);

      if (pegawaiList) {
        const emps: EmpEval[] = pegawaiList.map(p => {
          const records = absensiData?.filter(a => a.pegawai_id === p.id) || [];
          const hadir = records.filter(r => r.status === "hadir").length;
          const total = records.length || 1;
          const score = Math.round((hadir / total) * 100);
          return { pegawai_id: p.id, name: p.nama, score, status: getStatus(score) };
        });
        setEmployees(emps);
      }
    };
    fetchData();
  }, []);

  const handleSave = () => {
    toast({ title: "Evaluasi disimpan", description: `Catatan untuk ${selected?.name} telah disimpan.` });
    setSelected(null);
    setNote("");
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-foreground">Evaluasi Pegawai</h1>

      {selected ? (
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Evaluasi: {selected.name}</h3>
            <p className="text-xs text-muted-foreground">Skor Kedisiplinan: {selected.score}% — {selected.status}</p>
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
          {employees.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">Belum ada data</p>
          )}
          {employees.map((emp) => (
            <Card key={emp.pegawai_id} className="cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all" onClick={() => setSelected(emp)}>
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
