import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TreePalm } from "lucide-react";

const HakCuti = () => {
  const { user } = useAuth();
  const [cutiData, setCutiData] = useState<{ jumlah_hak: number; sisa_cuti: number } | null>(null);
  const [riwayat, setRiwayat] = useState<Array<{ tanggal_mulai: string | null; jenis: string | null; tanggal_selesai: string | null; status: string }>>([]);

  useEffect(() => {
    if (!user?.pegawaiId) return;
    const fetchCuti = async () => {
      const year = new Date().getFullYear();
      
      // Get cuti quota for this year
      const { data: quota } = await supabase
        .from("cuti")
        .select("jumlah_hak, sisa_cuti")
        .eq("pegawai_id", user.pegawaiId!)
        .eq("tahun", year)
        .is("tanggal_mulai", null)
        .maybeSingle();

      if (quota) {
        setCutiData(quota);
      } else {
        setCutiData({ jumlah_hak: 12, sisa_cuti: 12 });
      }

      // Get cuti history (ones with dates)
      const { data: history } = await supabase
        .from("cuti")
        .select("tanggal_mulai, tanggal_selesai, jenis, status")
        .eq("pegawai_id", user.pegawaiId!)
        .not("tanggal_mulai", "is", null)
        .order("created_at", { ascending: false })
        .limit(10);

      if (history) setRiwayat(history);
    };
    fetchCuti();
  }, [user?.pegawaiId]);

  const jumlahHak = cutiData?.jumlah_hak || 12;
  const sisaCuti = cutiData?.sisa_cuti || 12;
  const terpakai = jumlahHak - sisaCuti;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-foreground">Hak Cuti</h1>

      <Card className="border-0 bg-primary text-primary-foreground">
        <CardContent className="p-5 text-center space-y-2">
          <TreePalm className="mx-auto h-8 w-8 opacity-80" />
          <p className="text-4xl font-bold">{sisaCuti}</p>
          <p className="text-sm opacity-80">Sisa Hak Cuti Tahun {new Date().getFullYear()}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xl font-bold text-foreground">{jumlahHak}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xl font-bold text-warning">{terpakai}</p>
            <p className="text-xs text-muted-foreground">Terpakai</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xl font-bold text-success">{sisaCuti}</p>
            <p className="text-xs text-muted-foreground">Sisa</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-sm font-semibold text-foreground">Riwayat Cuti</h2>
      <div className="space-y-2">
        {riwayat.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">Belum ada riwayat cuti</p>
        )}
        {riwayat.map((c, i) => (
          <Card key={i}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-semibold text-foreground">{c.jenis || "Cuti"}</p>
                <p className="text-xs text-muted-foreground">
                  {c.tanggal_mulai ? new Date(c.tanggal_mulai).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                </p>
              </div>
              <Badge variant="outline" className={
                c.status === "approved" ? "bg-success/10 text-success border-success/20" :
                c.status === "rejected" ? "bg-destructive/10 text-destructive border-destructive/20" :
                "bg-warning/10 text-warning border-warning/20"
              }>
                {c.status === "approved" ? "Disetujui" : c.status === "rejected" ? "Ditolak" : "Pending"}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HakCuti;
