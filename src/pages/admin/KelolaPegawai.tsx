import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, UserPlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { UserRole } from "@/contexts/AuthContext";

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
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [form, setForm] = useState({ nama: "", jabatan: "", departemen: "" });
  const [userForm, setUserForm] = useState({
    nama: "",
    email: "",
    password: "",
    role: "pegawai" as UserRole,
    jabatan: "",
    departemen: "",
  });
  const [creating, setCreating] = useState(false);

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

  const handleCreateUser = async () => {
    if (!userForm.nama || !userForm.email || !userForm.password) {
      toast({ title: "Lengkapi semua data wajib", variant: "destructive" });
      return;
    }
    if (userForm.password.length < 6) {
      toast({ title: "Password minimal 6 karakter", variant: "destructive" });
      return;
    }

    setCreating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("create-user", {
        body: {
          nama: userForm.nama,
          email: userForm.email,
          password: userForm.password,
          role: userForm.role,
          jabatan: userForm.jabatan || "Staff",
          departemen: userForm.departemen || "Umum",
        },
      });

      if (res.error) {
        toast({ title: "Gagal membuat user", description: res.error.message, variant: "destructive" });
        return;
      }

      if (res.data?.error) {
        toast({ title: "Gagal membuat user", description: res.data.error, variant: "destructive" });
        return;
      }

      toast({ title: "User berhasil dibuat", description: `${userForm.nama} (${userForm.role})` });
      setUserDialogOpen(false);
      setUserForm({ nama: "", email: "", password: "", role: "pegawai", jabatan: "", departemen: "" });
      fetchPegawai();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Data Pegawai</h1>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-1" onClick={() => setUserDialogOpen(true)}>
            <UserPlus className="h-4 w-4" /> Tambah User
          </Button>
          <Button size="sm" className="gap-1" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" /> Tambah
          </Button>
        </div>
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

      {/* Dialog Tambah Pegawai (tanpa akun) */}
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

      {/* Dialog Tambah User (dengan akun login) */}
      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah User Baru</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Nama Lengkap <span className="text-destructive">*</span></Label>
              <Input
                value={userForm.nama}
                onChange={e => setUserForm({ ...userForm, nama: e.target.value })}
                placeholder="Nama lengkap"
              />
            </div>
            <div className="space-y-1">
              <Label>Email <span className="text-destructive">*</span></Label>
              <Input
                type="email"
                value={userForm.email}
                onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                placeholder="email@contoh.com"
              />
            </div>
            <div className="space-y-1">
              <Label>Password <span className="text-destructive">*</span></Label>
              <Input
                type="password"
                value={userForm.password}
                onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                placeholder="Minimal 6 karakter"
              />
            </div>
            <div className="space-y-1">
              <Label>Role <span className="text-destructive">*</span></Label>
              <Select value={userForm.role} onValueChange={(v) => setUserForm({ ...userForm, role: v as UserRole })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pegawai">Pegawai</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="pimpinan">Pimpinan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Jabatan</Label>
              <Input
                value={userForm.jabatan}
                onChange={e => setUserForm({ ...userForm, jabatan: e.target.value })}
                placeholder="Staff"
              />
            </div>
            <div className="space-y-1">
              <Label>Departemen</Label>
              <Input
                value={userForm.departemen}
                onChange={e => setUserForm({ ...userForm, departemen: e.target.value })}
                placeholder="Umum"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserDialogOpen(false)}>Batal</Button>
            <Button onClick={handleCreateUser} disabled={creating}>
              {creating ? "Membuat..." : "Buat User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KelolaPegawai;
