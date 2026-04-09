"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L, { LeafletEvent } from "leaflet";
import { useMap } from "react-leaflet";
import { useEffect, useState } from "react";

import ZoomControls from "@/components/ZoomControls";
import { createGpsIcon } from "@/components/GpsPin";
import { createClusterIcon, CLUSTER_CONFIG } from "@/lib/clusterIcon";

import type { PropertyMapPin } from "@/types/property";

// 🔥 Fix Leaflet
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
}


// ICONOS POR TIPO
const TYPE_ICONS: Record<PropertyMapPin["type"], string> = {
  casa: "/house.svg",
  departamento: "/department.svg",
  terreno: "/land.svg",
  oficina: "/local.svg",
};

// ICONO NORMAL
function createPinIcon(type: PropertyMapPin["type"]) {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width:28px;
        height:28px;
        background:#3b82f6;
        border-radius:50%;
        display:flex;
        align-items:center;
        justify-content:center;
        border:2px solid white;
        box-shadow:0 2px 6px rgba(0,0,0,0.3);
      ">
        <img src="${TYPE_ICONS[type]}" style="width:16px;height:16px;" />
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });
}

// ICONO SELECCIONADO
function createSelectedIcon(type: PropertyMapPin["type"]) {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width:40px;
        height:40px;
        background:#ef4444;
        border-radius:50%;
        display:flex;
        align-items:center;
        justify-content:center;
        border:3px solid white;
        box-shadow:0 4px 12px rgba(0,0,0,0.4);
      ">
        <img src="${TYPE_ICONS[type]}" style="width:20px;height:20px;" />
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });
}
interface MapViewProps {
  properties: PropertyMapPin[];
  center?: [number, number];
  zoom?: number;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  isLoading?: boolean;
  error?: string | null;
  userLocation?: [number, number] | null;
}

export default function MapView({
  properties = [],
  center = [-17.3924, -66.1461],
  zoom = 12,
  selectedId,
  onSelect,
  isLoading = false,
  error = null,
  userLocation,
}: MapViewProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  if (!isMounted)
    return <div className="w-full h-full bg-gray-100 animate-pulse" />;

  const selectedProperty = properties.find((p) => p.id === selectedId);

  return (
    <div className="relative w-full h-full">
      {/* LOADING */}
      {isLoading && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-white px-4 py-2 rounded-full shadow text-sm">
          Cargando propiedades...
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-red-50 px-4 py-2 rounded-full shadow text-sm text-red-600">
          ⚠️ {error}
        </div>
      )}

      <MapContainer
        center={userLocation || center}
        zoom={zoom}
        zoomControl={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <ZoomControls />

        {/*  Usuario */}
        {userLocation && (
          <>
            <FlyToUser location={userLocation} />
            <Marker position={userLocation} icon={createGpsIcon()}>
              <Popup>Tu ubicación</Popup>
            </Marker>
          </>
        )}

        {/*  Fly a seleccionado */}
        {selectedProperty && (
          <FlyToSelected
            lat={selectedProperty.lat}
            lng={selectedProperty.lng}
          />
        )}

        {/* PROPIEDADES CON ICONOS */}
        <MarkerClusterGroup
          iconCreateFunction={(c: any) => createClusterIcon(c)}
          maxClusterRadius={CLUSTER_CONFIG.maxClusterRadius}
        >
          {properties.map((property) => {
            const isSelected = property.id === selectedId;

            return (
              <Marker
                key={property.id}
                position={[property.lat, property.lng]}
                icon={
                  isSelected
                    ? createSelectedIcon(property.type)
                    : createPinIcon(property.type)
                }
                eventHandlers={{
                  click: () => onSelect?.(property.id),
                }}
              >
                <Popup>{property.title}</Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}

// Fly usuario
function FlyToUser({ location }: { location: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(location, 15, { duration: 1.5 });
  }, [location, map]);

  return null;
}

// Fly propiedad
function FlyToSelected({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo([lat, lng], 18, { duration: 1.2 });
  }, [lat, lng, map]);

  return null;
}
