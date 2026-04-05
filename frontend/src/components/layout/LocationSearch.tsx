'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { MapPin, Search, Loader2, X, History } from 'lucide-react'
import { usePopularidad } from '@/hooks/usePopularidad'
import { useSearchFilters } from '@/hooks/useSearchFilters'

type Location = {
  id: string | number
  nombre: string
  departamento: string
}

type LocationSearchProps = {
  value: string
  onChange: (value: string) => void
}

export function LocationSearch({ value, onChange }: LocationSearchProps) {
  const [suggestions, setSuggestions] = useState<Location[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [history, setHistory] = useState<string[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  const { updateFilters } = useSearchFilters()
  const { registrarConsulta } = usePopularidad()

  // FUNCIÓN MODULAR DE SELECCIÓN
  const handleSelectLocation = (loc: Location) => {
    const fullName = `${loc.nombre} - ${loc.departamento} - Bolivia`

    // 1. "Avisamos" al sistema
    updateFilters({
      locationId: loc.id,
      query: fullName
    })

    // 2. Lógica interna del componente
    onChange(fullName)
    saveToHistory(fullName)
    setIsOpen(false)
    registrarConsulta(loc.id, fullName)
  }

  // Cargar historial al montar el componente
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory')
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory))
    }
  }, [])

  // Guardar en historial cuando se selecciona una ubicación
  const saveToHistory = (item: string) => {
    const updatedHistory = [item, ...history.filter((i) => i !== item)].slice(0, 5)
    setHistory(updatedHistory)
    localStorage.setItem('searchHistory', JSON.stringify(updatedHistory))
  }

  // --- LÓGICA DE LIMPIEZA (HU 2) --- --BitPro
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value

    // Filtro: Solo letras (incluye tildes y ñ), números, espacios y guiones.
    // Todo lo demás (emojis, @, #, $, etc.) se elimina al instante.
    const cleanValue = rawValue.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-]/gi, '')

    onChange(cleanValue)
  }

  const isSelected = value.includes('Bolivia')

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const fetchLocations = async () => {
      if (value.trim().length < 2 || isSelected) {
        setSuggestions([])
        return
      }
      setIsLoading(true)
      try {
        const res = await fetch(
          `http://localhost:5000/api/locations/search?q=${encodeURIComponent(value)}`
        )
        if (res.ok) {
          const data = await res.json()
          setSuggestions(data)
          setIsOpen(true)
        }
      } catch {
      } finally {
        setIsLoading(false)
      }
    }
    const timer = setTimeout(fetchLocations, 300)
    return () => clearTimeout(timer)
  }, [value, isSelected])

  return (
    // CONTENEDOR RAÍZ ENCOGIDO (max-w-xl en md, max-w-lg en sm)
    <div className="w-full max-w-lg md:max-w-xl lg:max-w-2xl mx-auto relative" ref={containerRef}>
      <label className="block text-sm font-semibold text-stone-700 mb-2 text-center uppercase tracking-wider font-montserrat">
        Ciudad / Zona
      </label>

      {/* CONTENEDOR PRINCIPAL DEL BUSCADOR (Bordes Redondos, Sombra) */}
      <div
        className={`h-12 w-full rounded-full border transition-all duration-300 flex items-center px-4 bg-white shadow-sm hover:shadow-md ${
          isOpen && suggestions.length > 0
            ? 'border-amber-500 ring-4 ring-amber-500/20'
            : 'border-stone-200 focus-within:border-amber-500 focus-within:ring-4 focus-within:ring-amber-500/20'
        }`}
      >
        {/* Ícono de ubicación fijo a la izquierda */}
        <MapPin
          className={`w-5 h-5 flex-shrink-0 transition-colors duration-300 ${value ? 'text-amber-600' : 'text-stone-400'}`}
        />

        {/* CONTENEDOR DEL INPUT CORREGIDO: Bandera integrada */}
        <div className="relative flex-1 flex items-center h-full mx-3 min-w-0">
          <input
            type="text"
            value={value}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            placeholder="Cochabamba, La Paz..."
            // Agregué flex-1 y min-w-0 para que el texto se trunque y deje espacio a la bandera
            className="flex-1 h-full bg-transparent outline-none text-sm text-stone-800 placeholder:text-stone-400 font-inter z-10 truncate min-w-0"
          />

          {/* LA BANDERA: Integrada después del input como elemento flex */}
          {isSelected && (
            <div className="flex-shrink-0 ml-2 mb-[1px]">
              <Image
                src="https://flagcdn.com/w20/bo.png"
                alt="BO"
                width={20}
                height={14}
                className="rounded-sm shadow-sm"
              />
            </div>
          )}
        </div>

        {/* CONTENEDOR PROTEGIDO PARA LA "X" O EL LOADER (No se oculta) */}
        <div className="flex-shrink-0 flex items-center justify-center w-6 h-full z-20">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
          ) : (
            value && (
              <button
                onClick={() => onChange('')}
                type="button"
                className="p-1 rounded-full hover:bg-stone-100 transition-colors focus:outline-none group"
                aria-label="Limpiar"
              >
                <X className="w-4 h-4 text-stone-400 group-hover:text-red-500 transition-colors" />
              </button>
            )
          )}
        </div>
      </div>

      {/* PANEL DESPLEGABLE (También encogido y alineado) */}
      {isOpen && (
        <div className="absolute z-[100] w-full mt-3 bg-white border border-stone-100 rounded-2xl shadow-xl overflow-hidden ring-1 ring-black/5">
          {/* CASO A: MOSTRAR HISTORIAL (Input vacío) */}
          {value.trim().length === 0 && history.length > 0 && (
            <div>
              <div className="px-5 py-3 bg-stone-50 border-b border-stone-100">
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                  Búsquedas recientes
                </span>
              </div>
              {history.map((item, idx) => (
                <button
                  key={`hist-${idx}`}
                  type="button"
                  onClick={() => {
                    onChange(item)
                    setIsOpen(false)
                    updateFilters({ query: item })
                  }}
                  className="w-full px-5 py-3.5 flex items-center gap-3 hover:bg-amber-50 transition-colors text-left border-b border-stone-50 last:border-0 group"
                >
                  <History className="w-4 h-4 text-stone-300 group-hover:text-amber-500 transition-colors" />
                  <span className="text-sm font-medium text-stone-600">{item}</span>
                </button>
              ))}
            </div>
          )}

          {/* CASO B: MOSTRAR SUGERENCIAS (Escribiendo) */}
          {value.trim().length >= 2 && !isSelected && (
            <>
              {isLoading ? (
                <div className="px-4 py-8 text-center flex flex-col items-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
                  <span className="text-sm font-medium text-stone-500">Buscando zonas...</span>
                </div>
              ) : suggestions.length > 0 ? (
                <div className="max-h-[300px] overflow-y-auto">
                  {suggestions.slice(0, 5).map((loc) => (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => handleSelectLocation(loc)}
                      className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-amber-50 transition-colors text-left border-b border-stone-50 last:border-0 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Search className="w-4 h-4 text-stone-400 group-hover:text-amber-500 transition-colors flex-shrink-0" />
                        <span className="text-sm font-semibold text-stone-700 truncate min-w-0">
                          {loc.nombre}{' '}
                          <span className="font-normal text-stone-500">
                            - {loc.departamento} - Bolivia
                          </span>
                        </span>
                      </div>
                      <Image
                        src="https://flagcdn.com/w20/bo.png"
                        alt="BO"
                        width={20}
                        height={14}
                        className="rounded-sm shadow-sm flex-shrink-0"
                      />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-10 text-center bg-stone-50/50">
                  <p className="text-sm text-stone-700 font-semibold">
                    No se encontraron resultados
                  </p>
                  <p className="text-xs text-stone-500 mt-1">Pruebe con "Cala Cala"</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
