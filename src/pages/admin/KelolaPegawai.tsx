import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, MoreVertical } from "lucide-react";
import { useState } from "react";

const EMPLOYEES = [
  { id: "1", name: "Andi Pratama", position: "Staff Administrasi", dept: "Administrasi", status: "aktif" },
  { id: "2", name: "Dewi Lestari", position: "Staff Keuangan", dept: "Keuangan", status: "aktif" },
  { id: "3", name: "Budi Cahyo", position: "Koordinator Lapangan", dept: "Program", status: "aktif" },
  { id: "4", name: "Rina Sari", position: "Staff Program", dept: "Program", status: "cuti" },
  { id: "5", name: "Fajar Nugroho", position: "IT Support", dept: "IT", status: "aktif" },
  { id: "6", name: "Maya Putri", position: "Staff Komunikasi", dept: "Komunikasi", status: "aktif" },
];

const KelolaPegawai = () => {
  const [search, setSearch] = useState("");
  const filtered = EMPLOYEES.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.dept.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Data Pegawai</h1>
        <Button size="sm" className="gap-1">
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
                  {emp.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{emp.name}</p>
                  <p className="text-xs text-muted-foreground">{emp.position} • {emp.dept}</p>
                </div>
              </div>
              <Badge variant={emp.status === "aktif" ? "default" : "secondary"}>
                {emp.status.charAt(0).toUpperCase() + emp.status.slice(1)}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default KelolaPegawai;
