// MapView.js
import React, { useRef, useEffect } from "react";
import "ol/ol.css";
import useMapLogic from "./useMapLogic";
import MapControl from "./MapControl";

export default function MapView() {
    const mapRef = useRef();
    const popupRef = useRef();

    const {
        map,
        vectorSource,  // OpenLayers VectorSource
        draw,
        newFeature,
        newName,
        showListPopup,
        showSearchPopup,
        searchQuery,
        shapeTypeFilter,
        selectedData,
        confirmDelete,
        showNotificationPopup,
        notificationMessage,
        notificationType,
        setNewName,
        saveNewShape,
        goToShape,
        handleUpdate,
        handleDelete,
        confirmDeleteYes,
        confirmDeleteNo,
        handleClosePopup,
        setSearchQuery,
        setShapeTypeFilter,
        setShowListPopup,
        setShowSearchPopup,
        setShowNotificationPopup,
        addInteraction,
        setDraw,
        setNewFeature,
        setSelectedData,
        features,
        handleCancelDrawing,
        fetchData,
    } = useMapLogic(mapRef, popupRef);

    // Harita yüklendiğinde API’den tüm verileri çek
    useEffect(() => {
        if (vectorSource) {
            fetchData?.();
        }
    }, [vectorSource, fetchData]);

    return (
        <div>
            {/* Harita container */}
            <div
                ref={mapRef}
                style={{ marginTop: "60px", height: "calc(100vh - 60px)", width: "100%" }}
            />

            {/* Popup */}
            <div ref={popupRef} className="ol-popup">
                {selectedData && (
                    <div
                        style={{
                            background: "white",
                            padding: "10px",
                            borderRadius: "8px",
                            border: "1px solid gray",
                            minWidth: "250px",
                        }}
                    >
                        <h3>Güncelle</h3>
                        <input
                            type="text"
                            value={selectedData.name}
                            maxLength={30}
                            onChange={(e) =>
                                setSelectedData((prev) => ({ ...prev, name: e.target.value }))
                            }
                            style={{ width: "100%", marginBottom: "5px", padding: "5px" }}
                        />
                        <p style={{ fontSize: "12px", color: "gray", marginBottom: "10px" }}>
                            {selectedData.name.length}/30 karakter
                        </p>
                        <p><strong>Adres:</strong> {selectedData.address}</p>
                        <p><strong>WKT:</strong></p>
                        <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                            {selectedData.wkt}
                        </pre>
                        <div style={{ marginTop: "10px" }}>
                            <button onClick={handleUpdate} style={{ marginRight: "8px" }}>Kaydet</button>
                            <button onClick={handleDelete} style={{ marginRight: "8px", color: "red" }}>Sil</button>
                            <button onClick={handleClosePopup}>Kapat</button>
                        </div>
                    </div>
                )}
            </div>

            {/* MapControl */}
            <MapControl
                draw={draw}
                newFeature={newFeature}
                newName={newName}
                showListPopup={showListPopup}
                showSearchPopup={showSearchPopup}
                searchQuery={searchQuery}
                shapeTypeFilter={shapeTypeFilter}
                features={features}
                addInteraction={addInteraction}
                setNewName={setNewName}
                saveNewShape={saveNewShape}
                setShowListPopup={setShowListPopup}
                setShowSearchPopup={setShowSearchPopup}
                setSearchQuery={setSearchQuery}
                setShapeTypeFilter={setShapeTypeFilter}
                goToShape={goToShape}
                setDraw={setDraw}
                setNewFeature={setNewFeature}
                confirmDelete={confirmDelete}
                confirmDeleteYes={confirmDeleteYes}
                confirmDeleteNo={confirmDeleteNo}
                showNotificationPopup={showNotificationPopup}
                notificationMessage={notificationMessage}
                notificationType={notificationType}
                setShowNotificationPopup={setShowNotificationPopup}
                handleCancelDrawing={handleCancelDrawing}
            />
        </div>
    );
}
