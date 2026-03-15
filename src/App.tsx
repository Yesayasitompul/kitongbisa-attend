import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LoginPage from "@/pages/LoginPage";
import MobileLayout from "@/components/MobileLayout";
import PegawaiDashboard from "@/pages/pegawai/PegawaiDashboard";
import RiwayatAbsensi from "@/pages/pegawai/RiwayatAbsensi";
import JadwalKerja from "@/pages/pegawai/JadwalKerja";
import HakCuti from "@/pages/pegawai/HakCuti";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import KelolaPegawai from "@/pages/admin/KelolaPegawai";
import MonitoringKehadiran from "@/pages/admin/MonitoringKehadiran";
import LaporanAbsensi from "@/pages/admin/LaporanAbsensi";
import PimpinanDashboard from "@/pages/pimpinan/PimpinanDashboard";
import RekapKedisiplinan from "@/pages/pimpinan/RekapKedisiplinan";
import EvaluasiPegawai from "@/pages/pimpinan/EvaluasiPegawai";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage />} />
      </Routes>
    );
  }

  return (
    <MobileLayout>
      <Routes>
        {user?.role === "pegawai" && (
          <>
            <Route path="/dashboard" element={<PegawaiDashboard />} />
            <Route path="/riwayat" element={<RiwayatAbsensi />} />
            <Route path="/jadwal" element={<JadwalKerja />} />
            <Route path="/cuti" element={<HakCuti />} />
          </>
        )}
        {user?.role === "admin" && (
          <>
            <Route path="/dashboard" element={<AdminDashboard />} />
            <Route path="/pegawai" element={<KelolaPegawai />} />
            <Route path="/monitoring" element={<MonitoringKehadiran />} />
            <Route path="/laporan" element={<LaporanAbsensi />} />
          </>
        )}
        {user?.role === "pimpinan" && (
          <>
            <Route path="/dashboard" element={<PimpinanDashboard />} />
            <Route path="/rekap" element={<RekapKedisiplinan />} />
            <Route path="/evaluasi" element={<EvaluasiPegawai />} />
            <Route path="/laporan" element={<LaporanAbsensi />} />
          </>
        )}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </MobileLayout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
