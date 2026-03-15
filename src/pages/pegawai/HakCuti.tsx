import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TreePalm } from "lucide-react";

const HakCuti = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-foreground">Hak Cuti</h1>

      <Card className="border-0 bg-primary text-primary-foreground">
        <CardContent className="p-5 text-center space-y-2">
          <TreePalm className="mx-auto h-8 w-8 opacity-80" />
          <p className="text-4xl font-bold">8</p>
          <p className="text-sm opacity-80">Sisa Hak Cuti Tahun 2026</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xl font-bold text-foreground">12</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xl font-bold text-warning">4</p>
            <p className="text-xs text-muted-foreground">Terpakai</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xl font-bold text-success">8</p>
            <p className="text-xs text-muted-foreground">Sisa</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-sm font-semibold text-foreground">Riwayat Cuti</h2>
      <div className="space-y-2">
        {[
          { tanggal: "11 Mar 2026", jenis: "Cuti Tahunan", hari: 1, status: "approved" },
          { tanggal: "14 Feb 2026", jenis: "Cuti Sakit", hari: 2, status: "approved" },
          { tanggal: "20 Jan 2026", jenis: "Cuti Tahunan", hari: 1, status: "approved" },
        ].map((c, i) => (
          <Card key={i}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-semibold text-foreground">{c.jenis}</p>
                <p className="text-xs text-muted-foreground">{c.tanggal} • {c.hari} hari</p>
              </div>
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                Disetujui
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HakCuti;
