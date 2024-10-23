import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Envía un pageview a Google Analytics
    window.gtag("event", "page_view", {
      page_path: location.pathname + location.search,
    });
  }, [location]);

  return null; // Este componente no renderiza nada
};
