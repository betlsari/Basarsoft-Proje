import React from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import MapView from "./components/MapView";

function App() {
    return (
        <div style={{ height: "100vh", width: "100%", position: "relative" }}>
            <Navbar />
            <MapView />
        </div>
    );
}

export default App;
