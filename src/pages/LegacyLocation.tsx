import { Navigate, useLocation, useParams } from "react-router-dom";
import { useContent } from "@/content/useContent";
import NotFound from "./NotFound";
export default function LegacyLocation() {
  const { ilce, hizmet } = useParams();
  const { search } = useLocation();
  const { data = [], isLoading } = useContent();
  const path = `/bolgeler/istanbul/${ilce}/${hizmet}`;
  if (isLoading) return <p role="status">İçerik yükleniyor…</p>;
  return data.some((p) => p.path === path) ? (
    <Navigate replace to={path + (import.meta.env.DEV ? search : "")} />
  ) : (
    <NotFound />
  );
}
