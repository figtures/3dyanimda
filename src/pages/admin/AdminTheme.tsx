import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { Palette } from "lucide-react";
import { ThemeMixer } from "@/components/admin/ThemeMixer";

const AdminTheme = () => {
  const { tenant, hasPermission } = useAuth();
  const { refresh } = useTheme();
  const canChange = hasPermission("settings.theme");

  if (!tenant) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold flex items-center gap-2">
          <Palette className="h-5 w-5 text-accent-blue" /> Tema Studyosu
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Renk paleti, tipografi ve layout presetlerini karıştırarak markanıza özgü bir kombinasyon
          oluşturun. Seçiminiz anında public sitenize ve admin paneline uygulanır.
        </p>
      </div>

      <ThemeMixer tenantId={tenant.id} canEdit={canChange} onSaved={refresh} />
    </div>
  );
};

export default AdminTheme;