"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface LocationPickerMapProps {
  initialLat?: number | null;
  initialLng?: number | null;
  onLocationSelect: (lat: number, lng: number) => void;
  previewAvatar?: string | null;
  onPreviewClick?: () => void;
  theme?: "light" | "dark";
  lang?: string;
}

const mapTranslations: Record<string, any> = {
  en: {
    placeholder: "Search address...",
    searchBtn: "Search",
    searching: "...",
    locked: "Locked",
    unlock: "Unlock to edit",
    lock: "Lock location"
  },
  ru: {
    placeholder: "Поиск адреса...",
    searchBtn: "Найти",
    searching: "...",
    locked: "Заблокировано",
    unlock: "Разблокировать",
    lock: "Заблокировать"
  },
  id: {
    placeholder: "Cari alamat...",
    searchBtn: "Cari",
    searching: "...",
    locked: "Terkunci",
    unlock: "Buka kunci",
    lock: "Kunci lokasi"
  },
  zh: {
    placeholder: "搜索地址...",
    searchBtn: "搜索",
    searching: "...",
    locked: "已锁定",
    unlock: "解锁以编辑",
    lock: "锁定位置"
  },
  es: {
    placeholder: "Buscar dirección...",
    searchBtn: "Buscar",
    searching: "...",
    locked: "Bloqueado",
    unlock: "Desbloquear",
    lock: "Bloquear ubicación"
  },
  de: {
    placeholder: "Adresse suchen...",
    searchBtn: "Suchen",
    searching: "...",
    locked: "Gesperrt",
    unlock: "Entsperren",
    lock: "Standort sperren"
  },
  fr: {
    placeholder: "Rechercher une adresse...",
    searchBtn: "Rechercher",
    searching: "...",
    locked: "Verrouillé",
    unlock: "Déverrouiller",
    lock: "Verrouiller"
  },
  ja: {
    placeholder: "住所を検索...",
    searchBtn: "検索",
    searching: "...",
    locked: "ロック済み",
    unlock: "ロック解除",
    lock: "位置をロック"
  },
  ar: {
    placeholder: "البحث عن عنوان...",
    searchBtn: "بحث",
    searching: "...",
    locked: "مغلق",
    unlock: "فتح القفل للتحرير",
    lock: "قفل الموقع"
  },
  pt: {
    placeholder: "Pesquisar endereço...",
    searchBtn: "Pesquisar",
    searching: "...",
    locked: "Bloqueado",
    unlock: "Desbloquear para editar",
    lock: "Bloquear localização"
  },
  hi: {
    placeholder: "पता खोजें...",
    searchBtn: "खोजें",
    searching: "...",
    locked: "लॉक",
    unlock: "संपादित करने के लिए अनलॉक करें",
    lock: "स्थान लॉक करें"
  }
};;

export default function LocationPickerMap({
  initialLat,
  initialLng,
  onLocationSelect,
  previewAvatar,
  onPreviewClick,
  theme = "dark",
  lang = "en",
}: LocationPickerMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const markerInstance = useRef<maplibregl.Marker | null>(null);
  
  const t = mapTranslations[lang] || mapTranslations.en;
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Prevent accidental movement (always locked by default to prevent stray clicks)
  const [isLocked, setIsLocked] = useState(true);
  const isLockedRef = useRef(isLocked);
  
  useEffect(() => {
    isLockedRef.current = isLocked;
    if (markerInstance.current) {
      markerInstance.current.setDraggable(!isLocked);
    }
  }, [isLocked]);

  const mapTilerKey = "ICwSd7c82yVo427gx1ar";

  useEffect(() => {
    if (mapInstance.current || !mapContainer.current) return;

    // Get last saved location or default to [0, 0] if no initial coords
    let defaultLat = initialLat;
    let defaultLng = initialLng;
    let defaultZoom = 15;
    
    if (!initialLat || !initialLng) {
      defaultLat = 0;
      defaultLng = 0;
      try {
        const saved = localStorage.getItem("lastMapCenter");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.lng && parsed.lat) {
            defaultLng = parsed.lng;
            defaultLat = parsed.lat;
            if (parsed.zoom) defaultZoom = parsed.zoom;
          }
        }
      } catch (e) {
        console.warn("Failed to parse lastMapCenter", e);
      }
    }

    const styleUrl =
      theme === "dark"
        ? `https://api.maptiler.com/maps/streets-v2-dark/style.json?key=${mapTilerKey}`
        : `https://api.maptiler.com/maps/streets-v2/style.json?key=${mapTilerKey}`;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: styleUrl,
      center: [defaultLng, defaultLat],
      zoom: defaultZoom,
      minZoom: 5,
      maxZoom: 18,
      attributionControl: false,
      pitchWithRotate: false,
      dragRotate: false,
      touchZoomRotate: false,
      keyboard: false,
    });

    const geolocate = new maplibregl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true,
      showAccuracyCircle: false,
    });
    map.addControl(geolocate, "top-right");

    const createMarkerEl = () => {
      const el = document.createElement("div");
      el.style.width = "40px";
      el.style.height = "40px";
      el.style.borderRadius = "50%";
      el.style.border = "3px solid #ff5e00";
      el.style.boxShadow = "0 2px 10px rgba(0,0,0,0.5)";
      el.style.cursor = "pointer";
      el.style.overflow = "hidden";
      el.style.backgroundColor = "#333";
      
      if (previewAvatar) {
        el.innerHTML = `<img src="${previewAvatar}" style="width: 100%; height: 100%; object-fit: cover;" />`;
      } else {
        el.innerHTML = `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 20px;">📍</div>`;
      }
      
      if (onPreviewClick) {
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          onPreviewClick();
        });
      }
      
      return el;
    };

    const updateMarker = (lng: number, lat: number) => {
      if (!markerInstance.current) {
        markerInstance.current = new maplibregl.Marker({ element: createMarkerEl(), draggable: !isLockedRef.current })
          .setLngLat([lng, lat])
          .addTo(map);
          
        markerInstance.current.on('dragend', () => {
          const lngLat = markerInstance.current!.getLngLat();
          onLocationSelect(lngLat.lat, lngLat.lng);
        });
      } else {
        markerInstance.current.setLngLat([lng, lat]);
      }
      onLocationSelect(lat, lng);
    };

    if (initialLat && initialLng) {
      updateMarker(initialLng, initialLat);
    }

    map.on("click", (e) => {
      if (isLockedRef.current) return;
      updateMarker(e.lngLat.lng, e.lngLat.lat);
    });

    geolocate.on("geolocate", (e: any) => {
      setIsLocked(false);
      updateMarker(e.coords.longitude, e.coords.latitude);
    });

    // Hide default POIs
    map.on('style.load', () => {
      const style = map.getStyle();
      if (style && style.layers) {
        style.layers.forEach((layer) => {
          if (layer.id.includes('poi') || layer.source_layer === 'poi') {
            map.setLayoutProperty(layer.id, 'visibility', 'none');
          }
        });
      }
    });

    mapInstance.current = map;

    // Save location when map moves
    map.on('moveend', () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      localStorage.setItem("lastMapCenter", JSON.stringify({
        lng: center.lng,
        lat: center.lat,
        zoom: zoom
      }));
    });

    // Fix for map resizing issues (squares not loading fully)
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstance.current) {
        mapInstance.current.resize();
      }
    });
    resizeObserver.observe(mapContainer.current);

    return () => {
      if (mapContainer.current) {
        // cleanup observer
      }
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []); // Empty dependency array to prevent map destruction

  // Sync marker with external prop changes (if needed, mostly for initial load)
  useEffect(() => {
    if (!mapInstance.current || !initialLat || !initialLng) return;
    
    if (!markerInstance.current) {
      const el = document.createElement("div");
      el.style.width = "40px";
      el.style.height = "40px";
      el.style.borderRadius = "50%";
      el.style.border = "3px solid #ff5e00";
      el.style.boxShadow = "0 2px 10px rgba(0,0,0,0.5)";
      el.style.cursor = "pointer";
      el.style.overflow = "hidden";
      el.style.backgroundColor = "#333";
      
      if (previewAvatar) {
        el.innerHTML = `<img src="${previewAvatar}" style="width: 100%; height: 100%; object-fit: cover;" />`;
      } else {
        el.innerHTML = `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 20px;">📍</div>`;
      }
      
      if (onPreviewClick) {
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          onPreviewClick();
        });
      }
      
      markerInstance.current = new maplibregl.Marker({ element: el, draggable: !isLockedRef.current })
        .setLngLat([initialLng, initialLat])
        .addTo(mapInstance.current);
        
      markerInstance.current.on('dragend', () => {
        const lngLat = markerInstance.current!.getLngLat();
        onLocationSelect(lngLat.lat, lngLat.lng);
      });
    }
  }, [initialLat, initialLng, previewAvatar, onPreviewClick]);

  // Handle custom search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      // bbox for Bali, Indonesia to prevent showing US/Spain results
      const res = await fetch(`https://api.maptiler.com/geocoding/${encodeURIComponent(searchQuery)}.json?key=${mapTilerKey}&bbox=114.4,-8.9,115.7,-8.0`);
      const data = await res.json();
      setSearchResults(data.features || []);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const selectResult = (feature: any) => {
    const [lng, lat] = feature.center;
    if (mapInstance.current) {
      setIsLocked(false);
      mapInstance.current.flyTo({ center: [lng, lat], zoom: 16 });
      
      if (!markerInstance.current) {
        const el = document.createElement("div"); // Simple fallback, usually it's already created
        el.style.width = "40px";
        el.style.height = "40px";
        el.style.borderRadius = "50%";
        el.style.border = "3px solid #ff5e00";
        el.style.backgroundColor = "#333";
        el.innerHTML = `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 20px;">📍</div>`;
        
        markerInstance.current = new maplibregl.Marker({ element: el, draggable: true })
          .setLngLat([lng, lat])
          .addTo(mapInstance.current);
          
        markerInstance.current.on('dragend', () => {
          const lngLat = markerInstance.current!.getLngLat();
          onLocationSelect(lngLat.lat, lngLat.lng);
        });
      } else {
        markerInstance.current.setLngLat([lng, lat]);
      }
      
      onLocationSelect(lat, lng);
      setSearchResults([]);
      setSearchQuery(feature.place_name || feature.text);
    }
  };

  return (
    <div style={{ position: "relative", height: "300px", width: "100%", borderRadius: "12px", overflow: "hidden", border: "1px solid var(--surface-border)", backgroundColor: theme === "dark" ? "#1a1a1c" : "#f0f0f0" }}>
      {/* Search Overlay */}
      <div style={{ position: "absolute", top: "10px", left: "10px", right: "50px", zIndex: 10 }}>
        <form onSubmit={handleSearch} style={{ display: "flex", width: "100%", background: "var(--surface)", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.3)", overflow: "hidden", border: "1px solid var(--surface-border)" }}>
          <input 
            type="text" 
            placeholder={t.placeholder} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1, padding: "10px 14px", border: "none", background: "transparent", color: "var(--foreground)", fontSize: "0.9rem", outline: "none" }}
          />
          <button type="submit" disabled={isSearching} style={{ background: "var(--primary)", color: "#000", border: "none", padding: "0 16px", fontWeight: "bold", cursor: "pointer", opacity: isSearching ? 0.7 : 1 }}>
            {isSearching ? t.searching : t.searchBtn}
          </button>
        </form>
        
        {searchResults.length > 0 && (
          <div style={{ marginTop: "4px", background: "var(--surface)", borderRadius: "8px", border: "1px solid var(--surface-border)", boxShadow: "0 4px 15px rgba(0,0,0,0.4)", maxHeight: "200px", overflowY: "auto" }}>
            {searchResults.map((res: any) => (
              <div 
                key={res.id} 
                onClick={() => selectResult(res)}
                style={{ padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", fontSize: "0.85rem", display: "flex", flexDirection: "column" }}
              >
                <span style={{ fontWeight: "bold" }}>{res.text}</span>
                <span style={{ opacity: 0.7, fontSize: "0.75rem", marginTop: "2px" }}>{res.place_name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lock/Unlock Button */}
      <div style={{ position: "absolute", bottom: "15px", left: "15px", zIndex: 10 }}>
        <button 
          onClick={(e) => { e.preventDefault(); setIsLocked(!isLocked); }}
          style={{ 
            background: isLocked ? "rgba(30, 30, 30, 0.9)" : "var(--primary)",
            color: isLocked ? "#ffffff" : "#000",
            border: isLocked ? "1px solid rgba(255, 255, 255, 0.2)" : "1px solid var(--primary)",
            padding: "8px 12px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            boxShadow: "0 4px 15px rgba(0,0,0,0.4)",
            transition: "all 0.2s"
          }}
        >
          <span>{isLocked ? "🔒" : "🔓"}</span>
          <span style={{ fontSize: "0.85rem" }}>{isLocked ? t.unlock : t.lock}</span>
        </button>
      </div>
      
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }}></div>
      <style jsx global>{`
        .maplibregl-ctrl-group {
          background: rgba(30, 30, 30, 0.8) !important;
          backdrop-filter: blur(5px);
          border: 1px solid var(--surface-border) !important;
          border-radius: 8px !important;
        }
        .maplibregl-ctrl-group button {
          width: 36px !important;
          height: 36px !important;
        }
        .maplibregl-ctrl-icon {
          filter: invert(0.8) sepia(1) saturate(5) hue-rotate(350deg) brightness(1.2); /* Make it roughly orange */
        }
      `}</style>
    </div>
  );
}
