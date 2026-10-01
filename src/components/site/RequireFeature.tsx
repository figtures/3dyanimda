import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useFeature, useFeatures } from "@/contexts/FeatureContext";

export function RequireFeature({
  flag,
  redirectTo = "/",
  children,
}: {
  flag: string;
  redirectTo?: string;
  children: ReactNode;
}) {
  const { loading } = useFeatures();
  const on = useFeature(flag);
  if (loading) return null;
  if (!on) return <Navigate to={redirectTo} replace />;
  return <>{children}</>;
}