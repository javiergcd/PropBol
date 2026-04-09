"use client";

import { useState, useEffect, Suspense } from "react";
import nextDynamic from "next/dynamic";
import {
  ChevronLeft,
  ChevronRight,
  List as ListIcon,
  LayoutGrid,
  Key,
} from "lucide-react";

import { useProperties } from "@/hooks/useProperties";
import { useOrdenamiento } from "@/hooks/useOrdenamiento";

import FilterBar from "@/components/filters/FilterBar";
import PropertyCard from "@/components/layout/PropertyCard";
import PropertyRow from "@/components/galeria/PropertyRow";
import EmptyState from "@/components/galeria/EmptyState";
import { MenuOrdenamiento } from "@/components/busqueda/ordenamiento/MenuOrdenamiento";

const MapView = nextDynamic(() => import("./MapView"), { ssr: false });

// 🔥 distancia
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function BusquedaMapaContent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { properties, isLoading, error } = useProperties();
  const { ordenActual, cambiarOrden } = useOrdenamiento({
    inmuebles: properties,
  });

  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    null
  );
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  // 📍 botón ubicación
  const handleGetLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
      },
      () => alert("No se pudo obtener ubicación"),
      { enableHighAccuracy: true }
    );
  };

  // hover → fly
  useEffect(() => {
    if (!hoveredId) return;
    const t = setTimeout(() => setSelectedPropertyId(hoveredId), 200);
    return () => clearTimeout(t);
  }, [hoveredId]);

  // 🔥 orden cercanía
  const propertiesOrdenadas =
    ordenActual === "cercania" as any && userLocation
      ? [...properties].sort((a, b) => {
          const d1 = getDistance(
            userLocation[0],
            userLocation[1],
            a.lat,
            a.lng
          );
          const d2 = getDistance(
            userLocation[0],
            userLocation[1],
            b.lat,
            b.lng
          );
          return d1 - d2;
        })
      : properties;

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      <FilterBar variant="map" />

      <main className="flex flex-1 overflow-hidden relative">
        {/* SIDEBAR */}
        <aside
          className={`bg-white border-r transition-all duration-300 ${
            isSidebarOpen ? "w-full md:w-[450px]" : "w-0"
          }`}
        >
          {isSidebarOpen && (
            <div className="flex flex-col h-full">
              {/* HEADER */}
              <div className="p-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">
                    {properties.length} propiedades
                  </h2>

                  {/* 🔥 BOTÓN COLAPSAR (círculo rojo) */}
                  <button onClick={() => setIsSidebarOpen(false)}>
                    <ChevronLeft />
                  </button>
                </div>

                <MenuOrdenamiento
                  totalResultados={properties.length}
                  ordenActual={ordenActual}
                  onOrdenChange={cambiarOrden}
                />
              </div>

              {/* 🔥 TOGGLE GRID/LIST */}
              <div className="flex justify-end px-4 pb-2">
                <button onClick={() => setViewMode("grid")}>
                  <LayoutGrid />
                </button>
                <button onClick={() => setViewMode("list")}>
                  <ListIcon />
                </button>
              </div>

              {/* LISTA */}
              <div className="flex-1 overflow-y-auto p-4">
                {isLoading ? (
                  <p>Cargando...</p>
                ) : properties.length === 0 ? (
                  <EmptyState />
                ) : (
                  propertiesOrdenadas.map((property: any) => (
                    <div
                      key={property.id}
                      onMouseEnter={() => setHoveredId(property.id)}
                      onClick={() => setSelectedPropertyId(property.id)}
                    >
                      {viewMode === "grid" ? (
                        <PropertyCard
                          imagen="/images/inmuebleFoto.jpg"
                          estado={property.type}
                          precio={`${property.price}`}
                          descripcion={property.title}
                          camas={3}
                          banos={2}
                          metros={150}
                        />
                      ) : (
                        <PropertyRow
                          title={property.title}
                          price={`${property.price}`}
                          size="150m²"
                          image="/images/inmuebleFoto.jpg"
                          contactType="Facebook"
                        />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </aside>

        {/* MAPA */}
        <section className="flex-1 relative">
          {/* 🔥 REABRIR SIDEBAR */}
          {!isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="absolute left-0 top-4 z-[1000] bg-white p-2 shadow"
            >
              <ChevronRight />
            </button>
          )}

          {/* 🔥 BOTÓN UBICACIÓN (círculo rojo faltante) */}
          <button
            onClick={handleGetLocation}
            className="absolute top-4 right-4 z-[1000] bg-white px-3 py-2 rounded-lg shadow hover:bg-gray-100"
          >
            📍 Mi ubicación
          </button>

          <div className="absolute inset-0">
            <MapView
              properties={propertiesOrdenadas}
              selectedId={selectedPropertyId}
              onSelect={setSelectedPropertyId}
              isLoading={isLoading}
              error={error}
              userLocation={userLocation}
            />
          </div>
        </section>
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <BusquedaMapaContent />
    </Suspense>
  );
}