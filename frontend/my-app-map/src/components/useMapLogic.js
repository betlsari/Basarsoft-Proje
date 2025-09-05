// Amaç: Ekleme, güncelleme, silme ve harita etkileşimleri gibi tüm harita mantığını yönetmek
import { useEffect, useState, useCallback } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Draw, Translate } from "ol/interaction";
import { Fill, Stroke, Style, Text } from "ol/style";
import { WKT } from "ol/format";
import Overlay from "ol/Overlay";
import Messages from "../constants/Messages";

const API_URL = "http://localhost:5266/api/Feature"; // HTTP portu ile


const turkeyCenter = [3890000, 4720000];

export default function useMapLogic(mapRef, popupRef) {
    const [map, setMap] = useState(null);
    const [vectorSource] = useState(new VectorSource());
    const [draw, setDraw] = useState(null);
    const [translate, setTranslate] = useState(null);
    const [features, setFeatures] = useState([]);
    const [newFeature, setNewFeature] = useState(null);
    const [newName, setNewName] = useState("");
    const [selectedData, setSelectedData] = useState(null);
    const [showListPopup, setShowListPopup] = useState(false);
    const [showSearchPopup, setShowSearchPopup] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [shapeTypeFilter, setShapeTypeFilter] = useState("Hepsi");
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [showNotificationPopup, setShowNotificationPopup] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState("");
    const [notificationType, setNotificationType] = useState("success");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(5);
    const [totalCount, setTotalCount] = useState(0);

    // Verileri API'den çekme fonksiyonu 
    const fetchData = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/GetAll/GetAll?page=1&pageSize=1000`);
            const data = await res.json();
            console.log("API verisi:", data.data);

            if (!data.success || !data.data) return;

            const wktFormat = new WKT();
            const loaded = data.data.map((f) => {
                const feature = wktFormat.readFeature(f.wkt, {
                    dataProjection: "EPSG:4326",
                    featureProjection: "EPSG:3857",
                });
                feature.set("id", f.id);
                feature.set("name", f.name);
                feature.set("typeEmoji", "📌");
                return feature;
            });

            // Vektör kaynağını temizle ve yeni verileri ekle
            vectorSource.clear({ fast: true });
            vectorSource.addFeatures(loaded);

            // React state'ini güncelle
            setFeatures(loaded);
            if (data.extra?.Count) setTotalCount(data.extra.Count);
        } catch (err) {
            console.error("GetAll hatası:", err);
            setNotificationMessage(`Veri çekme sırasında hata oluştu: ${err.message}`);
            setNotificationType("error");
            setShowNotificationPopup(true);
        }
    }, [vectorSource]);

    const paginatedFeatures = features
        .filter(
            (f) =>
                f.get("name")?.toLowerCase().includes(searchQuery.toLowerCase()) &&
                (shapeTypeFilter === "Hepsi" || f.getGeometry().getType() === shapeTypeFilter)
        )
        .slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const totalPages = Math.ceil(
        features.filter(
            (f) =>
                f.get("name")?.toLowerCase().includes(searchQuery.toLowerCase()) &&
                (shapeTypeFilter === "Hepsi" || f.getGeometry().getType() === shapeTypeFilter)
        ).length / pageSize
    );

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    // Harita oluşturma ve başlangıç verilerini yükleme
    useEffect(() => {
        if (!mapRef.current) return;

        const vectorLayer = new VectorLayer({
            source: vectorSource,
            style: (feature) =>
                new Style({
                    stroke: new Stroke({ color: "#DB7093", width: 2 }),
                    fill: new Fill({ color: "rgba(0,0,255,0.1)" }),
                    text: new Text({
                        text: feature.get("typeEmoji") || "📌",
                        font: "20px sans-serif",
                        offsetY: -15,
                    }),
                }),
        });

        const popupOverlay = new Overlay({
            element: popupRef.current,
            autoPan: true,
            autoPanAnimation: { duration: 250 },
        });

        const olMap = new Map({
            target: mapRef.current,
            layers: [new TileLayer({ source: new OSM() }), vectorLayer],
            view: new View({
                center: turkeyCenter,
                zoom: 6,
                minZoom: 5,
                maxZoom: 12,
            }),
            overlays: [popupOverlay],
        });

        setMap(olMap);
        fetchData(); // Uygulama ilk yüklendiğinde verileri çek
        return () => olMap.setTarget(undefined);
    }, [mapRef, popupRef, vectorSource, fetchData]);

    // Translate etkileşimini haritaya ekleme
    useEffect(() => {
        if (!map) return;

        const translateInteraction = new Translate({
            features: vectorSource.getFeaturesCollection(),
        });

        translateInteraction.on("translateend", async (e) => {
            const feature = e.features.item(0);
            if (!feature?.get("id")) return;

            const wktFormat = new WKT();
            const wktText = wktFormat.writeFeature(feature, {
                dataProjection: "EPSG:4326",
                featureProjection: "EPSG:3857",
            });

            try {
                const res = await fetch(`${API_URL}/Update/Update/${feature.get("id")}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        Name: feature.get("name"),
                        WKT: wktText,
                    }),
                });

                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

                const result = await res.json();

                if (result.success) {
                    setNotificationMessage(Messages.PointUpdated);
                    setNotificationType("success");
                } else {
                    setNotificationMessage(result.message || "Güncelleme başarısız");
                    setNotificationType("error");
                }

                setShowNotificationPopup(true);
            } catch (err) {
                console.error("Translate güncelleme hatası:", err);
                setNotificationMessage(`Güncelleme sırasında hata oluştu: ${err.message}`);
                setNotificationType("error");
                setShowNotificationPopup(true);
            }
        });

        map.addInteraction(translateInteraction);
        setTranslate(translateInteraction);

        return () => {
            map.removeInteraction(translateInteraction);
        };
    }, [map, vectorSource]);


    const addInteraction = (type) => {
        if (!map) return;
        if (draw) map.removeInteraction(draw);
        const newDraw = new Draw({ source: vectorSource, type });
        // Draw interaction
        newDraw.on("drawend", (e) => {
            const newDrawn = e.feature;
            newDrawn.set("typeEmoji", "📌");
            setNewFeature(newDrawn); // sadece state
            map.removeInteraction(newDraw);
        });
        map.addInteraction(newDraw);
        setDraw(newDraw);
    };

    const handleCancelDrawing = () => {
        if (draw) {
            draw.abortDrawing();
            map.removeInteraction(draw);
        }
        const tempFeature = vectorSource.getFeatures().find((f) => !f.get("id"));
        if (tempFeature) vectorSource.removeFeature(tempFeature);
        setDraw(null);
        setNewFeature(null);
        setNewName("");
    };

    const saveNewShape = async () => {
        if (!newFeature || !newName) return;

        const wktFormat = new WKT();
        const wkt = wktFormat.writeFeature(newFeature, {
            dataProjection: "EPSG:4326",
            featureProjection: "EPSG:3857",
        });

        try {
            const res = await fetch(`${API_URL}/Add`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newName, wkt }),
            });
            const result = await res.json();

            if (result.success) {
                // Backend’den dönen feature’ı kalıcı hale getir
                const permanentFeature = wktFormat.readFeature(result.data.wkt, {
                    dataProjection: "EPSG:4326",
                    featureProjection: "EPSG:3857",
                });
                permanentFeature.set("id", result.data.id);
                permanentFeature.set("name", result.data.name);
                permanentFeature.set("typeEmoji", "📌");

                // Sadece geçici id’siz feature’ları sil, yeni eklenen kalıcı feature kaybolmaz
                const tempFeatures = vectorSource.getFeatures().filter(
                    f => !f.get("id") && f !== newFeature
                );
                tempFeatures.forEach(f => vectorSource.removeFeature(f));

                // Harita ve React state’ini güncelle
                vectorSource.addFeature(permanentFeature);
                setFeatures(prev => [...prev, permanentFeature]);

                setNotificationMessage(Messages.PointAdded);
                setNotificationType("success");
            } else {
                setNotificationMessage(Messages.ValidationError);
                setNotificationType("error");
            }
        } catch (err) {
            console.error("Kaydetme hatası:", err);
            setNotificationMessage(Messages.ValidationError);
            setNotificationType("error");
        } finally {
            // UI durumunu temizle
            setShowNotificationPopup(true);
            setNewName("");
            setNewFeature(null);
            if (draw) {
                map.removeInteraction(draw);
                setDraw(null);
            }
        }
    };


    const goToShape = async (feature) => {
        if (!map) return;
        const view = map.getView();
        const geometry = feature.getGeometry();
        const extent = geometry.getExtent();
        view.fit(extent, { maxZoom: 12, duration: 500, padding: [50, 50, 50, 50] });
        const coord = geometry.getInteriorPoint
            ? geometry.getInteriorPoint().getCoordinates()
            : geometry.getFirstCoordinate();
        let addressText = "Adres bulunamadı";
        try {
            const [x, y] = coord;
            const lon = (x / 20037508.34) * 180;
            let lat = (y / 20037508.34) * 180;
            lat = (180 / Math.PI) * (2 * Math.atan(Math.exp((lat * Math.PI) / 180)) - Math.PI / 2);
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
            if (res.ok) {
                const data = await res.json();
                addressText = data.display_name || addressText;
            }
        } catch (err) {
            console.error("Adres alınamadı:", err);
        }
        const wktFormat = new WKT();
        const wktText = wktFormat.writeFeature(feature, {
            dataProjection: "EPSG:4326",
            featureProjection: "EPSG:3857",
        });
        setSelectedData({
            id: feature.get("id"),
            name: feature.get("name"),
            geometryType: geometry.getType(),
            wkt: wktText,
            address: addressText,
            coord,
        });
        map.getOverlays().item(0).setPosition(coord);
        setShowListPopup(false);
        setShowSearchPopup(false);
    };

    const handleUpdate = async () => {
        if (!selectedData) return;
        if (!selectedData.name?.trim()) {
            setNotificationMessage("İsim boş olamaz!");
            setNotificationType("error");
            setShowNotificationPopup(true);
            return;
        }
        const feature = features.find((f) => f.get("id") === selectedData.id);
        if (feature) feature.set("name", selectedData.name);
        try {
            const res = await fetch(`${API_URL}/Update/Update/${selectedData.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ID: selectedData.id,
                    Name: selectedData.name,
                    WKT: selectedData.wkt,
                }),
            });
            const result = await res.json();
            if (result.success) {
                setNotificationMessage(Messages.PointUpdated);
                setNotificationType("success");
            } else {
                setNotificationMessage(result.message || "Güncelleme başarısız");
                setNotificationType("error");
            }
        } catch (err) {
            console.error("Güncelleme hatası:", err);
            setNotificationMessage(`Güncelleme sırasında hata oluştu: ${err.message}`);
            setNotificationType("error");
        }
        setShowNotificationPopup(true);
        setSelectedData(null);
        map.getOverlays().item(0)?.setPosition(undefined);
    };

    const handleDelete = () => setConfirmDelete(true);

    const confirmDeleteYes = async () => {
        if (!selectedData || !map) return;
        try {
            const res = await fetch(`${API_URL}/Delete/${selectedData.id}`, { method: "DELETE" });
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const result = await res.json();
            if (!result.success) throw new Error("Backend silme başarısız!");
            const featureToDelete = vectorSource.getFeatures().find((f) => f.get("id") === selectedData.id);
            if (featureToDelete) vectorSource.removeFeature(featureToDelete);
            setFeatures((prev) => prev.filter((f) => f.get("id") !== selectedData.id));
            setNotificationMessage(Messages.PointDeleted);
            setNotificationType("success");
        } catch (err) {
            console.error("Silme hatası:", err);
            setNotificationMessage(`${Messages.DeleteError}: ${err.message}`);
            setNotificationType("error");
        }
        setShowNotificationPopup(true);
        setSelectedData(null);
        setConfirmDelete(false);
        map.getOverlays().item(0)?.setPosition(undefined);
    };

    const confirmDeleteNo = () => setConfirmDelete(false);

    const handleClosePopup = () => {
        setSelectedData(null);
        map.getOverlays().item(0)?.setPosition(undefined);
        map.getView().setCenter(turkeyCenter);
        map.getView().setZoom(6);
    };

    return {
        map,
        draw,
        translate,
        newFeature,
        newName,
        showListPopup,
        showSearchPopup,
        searchQuery,
        shapeTypeFilter,
        selectedData,
        confirmDelete,
        features,
        paginatedFeatures,
        currentPage,
        pageSize,
        totalPages,
        totalCount,
        showNotificationPopup,
        notificationMessage,
        notificationType,
        vectorSource,
        setNewName,
        setNewFeature,
        setSelectedData,
        setShowListPopup,
        setShowSearchPopup,
        setShowNotificationPopup,
        setSearchQuery,
        setShapeTypeFilter,
        addInteraction,
        handleCancelDrawing,
        saveNewShape,
        goToShape,
        handleUpdate,
        handleDelete,
        confirmDeleteYes,
        confirmDeleteNo,
        handleClosePopup,
        handlePageChange,
    };
}
