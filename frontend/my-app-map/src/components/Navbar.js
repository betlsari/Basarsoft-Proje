import React from "react";

export default function Navbar({ onOpenSaved }) {
    const navbarHeight = 60;

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: `${navbarHeight}px`,
                backgroundColor: "#FFA07A", 
                color: "white",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0 20px",
                zIndex: 3000,
                fontSize: "20px",
                fontWeight: "bold",
            }}
        >
            <span>BaşarSoft Harita Uygulaması</span>
        </div>
    );
}
