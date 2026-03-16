import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Gavel, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmployeeMonitor {
  pegawai_id: string;
  name: string;
  masuk: string;
  pulang: string;
  status: string;
  totalTerlambat: number;
  totalAbsen: number;
}

const BATAS_PELANGGARAN = 5;

const JENIS_SANKSI = [
  { value: "teguran_lisan", label: "Teguran Lisan" },
  { value: "teguran_tertulis", label: "Teguran Tertulis" },
  { value: "sp1", label: "Surat Peringatan 1" },
  { value: "sp2", label: "Surat Peringatan 2" },
  { value: "sp3", label: "Surat Peringatan 3" },
];

const statusColor: Record<string, string> = {
  hadir: "bg-success/10 text-success border-success/20",
  terlambat: "bg-warning/10 text-warning border-warning/20",
  cuti: "bg-primary/10 text-primary border-primary/20",
  absen: "bg-destructive/10 text-destructive border-destructive/20",
  belum: "bg-muted text-muted-foreground",
};

const MonitoringKehadiran = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [employees, setEmployees] = useState<EmployeeMonitor[]>([]);
  const [summary, setSummary] = useState({ hadir: 0, terlambat: 0, cuti: 0, absen: 0 });
  const [sanksiDialog, setSanksiDialog] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<EmployeeMonitor | null>(null);
  const [jenisSanksi, setJenisSanksi] = useState("");
  const [catatanSanksi, setCatatanSanksi] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const today = new Date().toISOString().split("T")[0];
      const monthStart = new Date();
      monthStart.setDate(1);

      // Get all pegawai
      const { data: pegawaiList } = await supabase.from("pegawai").select("id, nama").eq("status", "aktif");
      if (!pegawaiList) return;

      // Get today's absensi
      const { data: absensiToday } = await supabase
        .from("absensi")
        .select("pegawai_id, jam_masuk, jam_pulang, status")
        .eq("tanggal", today);

      // Get monthly stats for all
      const { data: monthlyAbsensi } = await supabase
        .from("absensi")
        .select("pegawai_id, status")
        .gte("tanggal", monthStart.toISOString().split("T")[0]);

      const empList: EmployeeMonitor[] = pegawaiList.map(p => {
        const todayData = absensiToday?.find(a => a.pegawai_id === p.id);
        const monthData = monthlyAbsensi?.filter(a => a.pegawai_id === p.id) || [];
        return {
          pegawai_id: p.id,
          name: p.nama,
          masuk: todayData?.jam_masuk ? todayData.jam_masuk.substring(0, 5) : "-",
          pulang: todayData?.jam_pulang ? todayData.jam_pulang.substring(0, 5) : "-",
          status: todayData?.status || "belum",
          totalTerlambat: monthData.filter(a => a.status === "terlambat").length,
          totalAbsen: monthData.filter(a => a.status === "absen").length,
        };
      });

      setEmployees(empList);

      const h = empList.filter(e => e.status === "hadir").length;
      const t = empList.filter(e => e.status === "terlambat").length;
      const c = empList.filter(e => e.status === "cuti").length;
      const a = empList.filter(e => e.status === "belum" || e.status === "absen").length;
      setSummary({ hadir: h, terlambat: t, cuti: c, absen: a });
    };
    fetchData();
  }, []);

  const isPelanggaran = (emp: EmployeeMonitor) => (emp.totalTerlambat + emp.totalAbsen) >= BATAS_PELANGGARAN;

  const handleOpenSanksi = (emp: EmployeeMonitor) => {
    setSelectedEmp(emp);
    setJenisSanksi("");
    setCatatanSanksi("");
    setSanksiDialog(true);
  };

  const handleSimpanSanksi = async () => {
    if (!jenisSanksi || !selectedEmp) {
      toast({ title: "Pilih jenis sanksi", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("sanksi").insert({
      pegawai_id: selectedEmp.pegawai_id,
      jenis_sanksi: jenisSanksi,
      keterangan: catatanSanksi,
      diberikan_oleh: user?.id,
    });

    if (error) {
      toast({ title: "Gagal menyimpan sanksi", description: error.message, variant: "destructive" });
      return;
    }

    toast({
      title: "Sanksi Berhasil Disimpan",
      description: `${JENIS_SANKSI.find(s => s.value === jenisSanksi)?.label} untuk ${selectedEmp.name} telah disimpan. Notifikasi telah dikirim ke pegawai.`,
    });
    setSanksiDialog(false);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-foreground">Monitoring Kehadiran</h1>

      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          { label: "Hadir", val: summary.hadir, color: "text-success" },
          { label: "Terlambat", val: summary.terlambat, color: "text-warning" },
          { label: "Cuti", val: summary.cuti, color: "text-primary" },
          { label: "Absen", val: summary.absen, color: "text-destructive" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-3">
              <p className={`text-xl font-bold ${s.color}`}>{s.val}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-2">
        {employees.map((emp) => (
          <Card key={emp.pegawai_id} className={isPelanggaran(emp) ? "ring-2 ring-destructive/30" : ""}>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{emp.name}</p>
                  <p className="text-xs text-muted-foreground">Masuk: {emp.masuk} | Pulang: {emp.pulang}</p>
                </div>
                <Badge variant="outline" className={statusColor[emp.status] || ""}>
                  {emp.status.charAt(0).toUpperCase() + emp.status.slice(1)}
                </Badge>
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>Terlambat: <strong className="text-warning">{emp.totalTerlambat}x</strong></span>
                <span>Absen: <strong className="text-destructive">{emp.totalAbsen}x</strong></span>
              </div>

              {isPelanggaran(emp) && (
                <div className="flex items-center gap-2 pt-1">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="text-xs text-destructive font-medium">Pelanggaran melebihi batas</span>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="ml-auto gap-1 h-7 text-xs"
                    onClick={() => handleOpenSanksi(emp)}
                  >
                    <Gavel className="h-3 w-3" />
                    Beri Sanksi
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={sanksiDialog} onOpenChange={setSanksiDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pemberian Sanksi</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg bg-muted p-3">
              <p className="text-sm font-semibold text-foreground">{selectedEmp?.name}</p>
              <p className="text-xs text-muted-foreground">
                Terlambat: {selectedEmp?.totalTerlambat}x | Absen: {selectedEmp?.totalAbsen}x
              </p>
            </div>
            <div className="space-y-2">
              <Label>Jenis Sanksi</Label>
              <Select value={jenisSanksi} onValueChange={setJenisSanksi}>
                <SelectTrigger><SelectValue placeholder="Pilih jenis sanksi" /></SelectTrigger>
                <SelectContent>
                  {JENIS_SANKSI.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Catatan</Label>
              <Textarea
                placeholder="Tulis catatan sanksi..."
                value={catatanSanksi}
                onChange={(e) => setCatatanSanksi(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSanksiDialog(false)}>Batal</Button>
            <Button onClick={handleSimpanSanksi} className="gap-1">
              <Send className="h-4 w-4" />
              Simpan & Kirim Notifikasi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MonitoringKehadiran;
