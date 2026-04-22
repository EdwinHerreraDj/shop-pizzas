import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Al cambiar de ruta, reinicia el scroll al principio.
 * Se monta una única vez dentro del layout principal.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
