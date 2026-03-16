import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface PegawaiRow {
  id: string;
  nama: string;
  jabatan: string;
  departemen: string;
  status: string;
}

const KelolaPegawai = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [employees, setEmployees] = useState<PegawaiRow[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ nama: "", jabatan: "", departemen: "" });

  const fetchPegawai = async () => {
    const { data } = await supabase
      .from("pegawai")
      .select("id, nama, jabatan, departemen, status")
      .order("nama");
    if (data) setEmployees(data);
  };

  useEffect(() => { fetchPegawai(); }, []);

  const filtered = employees.filter((e) =>
    e.nama.toLowerCase().includes(search.toLowerCase()) ||
    e.departemen.toLowerCase().includes(search.toLowerCase())
  );

  const handleTambah = async () => {
    if (!form.nama || !form.jabatan) {
      toast({ title: "Lengkapi data", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("pegawai").insert({
      nama: form.nama,
      jabatan: form.jabatan,
      departemen: form.departemen || "Umum",
    });
    if (error) {
      toast({ title: "Gagal menambah pegawai", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Pegawai berhasil ditambahkan" });
    setDialogOpen(false);
    setForm({ nama: "", jabatan: "", departemen: "" });
    fetchPegawai();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Data Pegawai</h1>
        <Button size="sm" className="gap-1" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" /> Tambah
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cari pegawai..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="space-y-2">
        {filtered.map((emp) => (
          <Card key={emp.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                  {emp.nama.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{emp.nama}</p>
                  <p className="text-xs text-muted-foreground">{emp.jabatan} • {emp.departemen}</p>
                </div>
              </div>
              <Badge variant={emp.status === "aktif" ? "default" : "secondary"}>
                {emp.status.charAt(0).toUpperCase() + emp.status.slice(1)}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Pegawai</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Nama</Label>
              <Input value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} placeholder="Nama lengkap" />
            </div>
            <div className="space-y-1">
              <Label>Jabatan</Label>
              <Input value={form.jabatan} onChange={e => setForm({ ...form, jabatan: e.target.value })} placeholder="Jabatan" />
            </div>
            <div className="space-y-1">
              <Label>Departemen</Label>
              <Input value={form.departemen} onChange={e => setForm({ ...form, departemen: e.target.value })} placeholder="Departemen" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={handleTambah}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KelolaPegawai;
