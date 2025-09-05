import React, { useState } from "react";

const navbarHeight = 60;
const itemsPerPage = 5; // popup sayfalama için

export default function MapControl({
    features = [],
    draw,
    newFeature,
    newName,
    showListPopup,
    showSearchPopup,
    searchQuery,
    shapeTypeFilter,
    addInteraction,
    setNewName,
    saveNewShape,
    setShowListPopup,
    setShowSearchPopup,
    setSearchQuery,
    setShapeTypeFilter,
    goToShape,
    confirmDelete,
    confirmDeleteYes,
    confirmDeleteNo,
    showNotificationPopup,
    notificationMessage,
    notificationType,
    setShowNotificationPopup,
    handleCancelDrawing,
    enableTranslate
}) {
    const [currentPage, setCurrentPage] = useState(1);

    // Filtreleme
    const filteredFeatures = features.filter(
        (f) =>
            f.get("name")?.toLowerCase().includes(searchQuery.toLowerCase()) &&
            (shapeTypeFilter === "Hepsi" || f.getGeometry().getType() === shapeTypeFilter)
    );

    const totalPages = Math.ceil(filteredFeatures.length / itemsPerPage);
    const handlePinClick = (feature) => {
        setSearchQuery(feature.get("name"));
        setShapeTypeFilter(feature.getGeometry().getType());
        setShowListPopup(true);
        goToShape(feature); // Keep this to center the map on the feature
    };
    const currentItems = filteredFeatures.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > totalPages) return;
        setCurrentPage(newPage);
    };
    // Yeni çizilen şekli kaydet
    const handleSaveNewShape = () => {
        if (!newFeature || !newName) return;

        newFeature.set("name", newName); 
        saveNewShape(newFeature);       

        
        features.push(newFeature);      
    };


    return (
        <>
            {/* Silme Onay Popup */}
            {confirmDelete && (
                <div style={{
                    position: "fixed",
                    top: "45%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    background: "white",
                    padding: "20px",
                    borderRadius: "10px",
                    border: "1px solid gray",
                    zIndex: 5000,
                }}>
                    <p>Bu kaydı silmek istediğinize emin misiniz?</p>
                    <button onClick={confirmDeleteYes} style={{ marginRight: "8px" }}>Evet</button>
                    <button onClick={confirmDeleteNo}>Hayır</button>
                </div>
            )}

            {/* Yeni Şekil İsimlendirme */}
            {newFeature && (
                <div style={{
                    position: "fixed",
                    top: "40%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    background: "white",
                    border: "1px solid gray",
                    borderRadius: "10px",
                    padding: "20px",
                    zIndex: 4000,
                }}>
                    <h3>Bir isim verin</h3>
                    <input
                        type="text"
                        value={newName}
                        maxLength={30}
                        onChange={(e) => setNewName(e.target.value)}
                        style={{ width: "100%", padding: "5px", marginBottom: "5px" }}
                        placeholder="İsim girin"
                    />
                    <p style={{ fontSize: "12px", color: "gray", marginBottom: "10px" }}>
                        {newName.length}/30 karakter
                    </p>
                    <button onClick={saveNewShape} style={{ marginTop: "10px" }}>Kaydet</button>
                    <button onClick={handleCancelDrawing} style={{ marginTop: "10px", marginLeft: "10px" }}>İptal</button>
                </div>
            )}

            {/* Popup Açma Butonları */}
            <button
  onClick={() => {
    setCurrentPage(1);
    setShowListPopup(true);
  }}
  style={{
    position: "absolute",
    top: navbarHeight + 10,
    left: 10,
    zIndex: 1000,
      backgroundColor: "#FFB6C1", 
    color: "white",
    padding: "8px 12px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  }}
>
  Kaydedilenleri Listele
</button>

            <button
                onClick={() => {
                    setCurrentPage(1);
                    setShowSearchPopup(true);
                }}
                style={{
                    position: "absolute",
                    top: navbarHeight + 50,
                    left: 10,
                    zIndex: 1000,
                    backgroundColor: "#FFB6C1", 
                    color: "white",
                    padding: "8px 12px",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "bold",
                }}
            >
                Konum Ara
            </button>


            {/* Kaydedilenler Popup */}
            {showListPopup && (
                <div style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    background: "white",
                    borderRadius: "10px",
                    padding: "20px",
                    zIndex: 4000,
                    width: "300px",
                    maxHeight: "400px",
                    overflowY: "auto",
                }}>
                    <h3>Kaydedilen Konumlar</h3>
                    {filteredFeatures.length === 0 && <p>Henüz kayıt yok.</p>}
                    <ul>
                        {currentItems.map((f) => (
                            <li key={f.get("id") || f.ol_uid} style={{ marginBottom: "5px" }}>
                                {f.get("typeEmoji")} {f.get("name")} ({f.getGeometry().getType()})
                                <button onClick={() => goToShape(f)} style={{ marginLeft: "5px" }}>Git</button>
                            </li>
                        ))}
                    </ul>

                    {totalPages > 1 && (
                        <div style={{ marginTop: "10px", textAlign: "center" }}>
                            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>◀</button>
                            <span style={{ margin: "0 10px" }}>{currentPage} / {totalPages}</span>
                            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>▶</button>
                        </div>
                    )}
                    <button onClick={() => setShowListPopup(false)} style={{ marginTop: "10px" }}>Kapat</button>
                </div>
            )}

            {/* Arama Popup */}
            {showSearchPopup && (
                <div style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    background: "white",
                    borderRadius: "10px",
                    padding: "20px",
                    zIndex: 5000,
                    width: "300px",
                    maxHeight: "400px",
                    overflowY: "auto",
                }}>
                    <h3>Konum Ara</h3>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Konum adı girin"
                        style={{ width: "100%", marginBottom: "10px" }}
                    />
                    <select
                        value={shapeTypeFilter}
                        onChange={(e) => setShapeTypeFilter(e.target.value)}
                        style={{ width: "100%", marginBottom: "10px" }}
                    >
                        <option value="Hepsi">Hepsi</option>
                        <option value="Point">Point</option>
                        <option value="LineString">LineString</option>
                        <option value="Polygon">Polygon</option>
                    </select>

                    {filteredFeatures.length === 0 && <p>Hiç sonuç bulunamadı.</p>}
                    <ul>
                        {currentItems.map((f) => (
                            <li key={f.get("id") || f.ol_uid} style={{ marginBottom: "5px" }}>
                                {f.get("typeEmoji")} {f.get("name")} ({f.getGeometry().getType()})
                                <button onClick={() => goToShape(f)} style={{ marginLeft: "5px" }}>Git</button>
                            </li>
                        ))}
                    </ul>

                    {totalPages > 1 && (
                        <div style={{ marginTop: "10px", textAlign: "center" }}>
                            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>◀</button>
                            <span style={{ margin: "0 10px" }}>{currentPage} / {totalPages}</span>
                            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>▶</button>
                        </div>
                    )}
                    <button onClick={() => setShowSearchPopup(false)} style={{ marginTop: "10px" }}>Kapat</button>
                </div>
            )}

            {/* Bildirim Popup */}
            {showNotificationPopup && (
                <div style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    background: notificationType === "success" ? "#d4edda" : "#f8d7da",
                    color: notificationType === "success" ? "#155724" : "#721c24",
                    padding: "20px",
                    borderRadius: "10px",
                    border: `1px solid ${notificationType === "success" ? "#c3e6cb" : "#f5c6cb"}`,
                    zIndex: 6000,
                    textAlign: "center",
                }}>
                    <p style={{ margin: 0 }}>{notificationMessage}</p>
                    <button onClick={() => setShowNotificationPopup(false)} style={{ marginTop: "10px" }}>Tamam</button>
                </div>
            )}

            {/* Çizim Butonları */}
            <div
                style={{
                    position: "absolute",
                    top: navbarHeight + 100,
                    left: 10,
                    zIndex: 1000,
                }}
            >
                <button
                    style={{
                        backgroundColor: "lilac", // CSS'de geçmeyebilir
                        background: "plum",       // daha uyumlu lila ton
                        color: "white",
                        padding: "8px 12px",
                        marginBottom: "5px",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                    }}
                    onClick={() => addInteraction("Point")}
                >
                    Point Ekle 
                </button> 
                <br />
                <button
                    style={{
                        background: "plum",
                        color: "white",
                        padding: "8px 12px",
                        marginBottom: "5px",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                    }}
                    onClick={() => addInteraction("LineString")}
                >
                    Linestring Ekle
                </button>
                <br />
                <button
                    style={{
                        background: "plum",
                        color: "white",
                        padding: "8px 12px",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                    }}
                    onClick={() => addInteraction("Polygon")}
                >
                    Polygon Ekle
                </button>
            </div>


            {/* Çizim İptal/Bitir */}
            <div style={{ position: "absolute", top: "10px", right: "10px", zIndex: 1000 }}>
                {draw && (
                    <>
                        <button onClick={() => draw.finishDrawing()}>Bitir</button>
                        <button onClick={handleCancelDrawing}>İptal</button>
                    </>
                )}
            </div>
        </>
    );
}
