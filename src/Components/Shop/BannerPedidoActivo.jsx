import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

export default function BannerPedidoActivo() {
    const [codigo, setCodigo] = useState(null);
    const location = useLocation();

    useEffect(() => {
        const guardado = localStorage.getItem("pedido_activo");
        setCodigo(guardado || null);
    }, [location]);

    // No mostrar si no hay pedido o si ya estamos en la página de tracking
    if (!codigo || location.pathname.startsWith("/pedido")) return null;

    return (
        <div
            className="position-fixed bottom-0 start-0 end-0 z-3"
            style={{ pointerEvents: "none" }}
        >
            <div
                className="container pb-3 d-flex justify-content-center"
                style={{ pointerEvents: "auto" }}
            >
                <Link
                    to={`/pedido/${codigo}`}
                    className="d-inline-flex align-items-center gap-2 px-4 py-3 rounded-pill text-white fw-semibold text-decoration-none shadow-lg"
                    style={{
                        backgroundColor: "#eb0029",
                        fontSize: "0.95rem",
                        animation: "pulse-banner 2s infinite",
                    }}
                >
                    <i className="bi bi-geo-alt-fill" />
                    Tienes un pedido en curso
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
