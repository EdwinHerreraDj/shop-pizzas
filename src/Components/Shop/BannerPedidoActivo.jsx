import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

export default function BannerPedidoActivo() {
    const [codigos, setCodigos] = useState([]);
    const location = useLocation();

    useEffect(() => {
        try {
            const activos = JSON.parse(localStorage.getItem("pedidos_activos") || "[]");
            setCodigos(activos);
        } catch {
            setCodigos([]);
        }
    }, [location]);

    if (codigos.length === 0 || location.pathname.startsWith("/pedido")) return null;

    return (
        <div
            className="position-fixed bottom-0 start-0 end-0"
            style={{ pointerEvents: "none", zIndex: 1050, marginBottom: "1rem" }}
        >
            <div
                className="container d-flex flex-column align-items-center gap-2"
                style={{ pointerEvents: "auto" }}
            >
                {codigos.map((codigo) => (
                    <Link
                        key={codigo}
                        to={`/pedido/${codigo}`}
                        className="d-inline-flex align-items-center gap-2 px-4 py-3 rounded-pill text-white fw-semibold text-decoration-none shadow-lg"
                        style={{
                            backgroundColor: "#eb0029",
                            fontSize: "0.95rem",
                            animation: "pulse-banner 2s infinite",
                        }}
                    >
                        <i className="bi bi-geo-alt-fill" />
                        {codigos.length > 1 ? "Pedido en curso" : "Tienes un pedido en curso"}
                        <span
                            className="badge bg-white rounded-pill ms-1"
                            style={{
                                color: "#eb0029",
                                fontSize: "0.75rem",
                                fontFamily: "monospace",
                            }}
                        >
                            {codigo}
                        </span>
                        <i className="bi bi-chevron-right" />
                    </Link>
                ))}
            </div>

            <style>{`
                @keyframes pulse-banner {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.02); }
                }
            `}</style>
        </div>
    );
}
