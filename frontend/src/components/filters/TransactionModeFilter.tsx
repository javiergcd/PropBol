'use client'

interface TransactionModeFilterProps {
  modoSeleccionado: string[]
  onModoChange: (modo: string[]) => void
}

export default function TransactionModeFilter({
  modoSeleccionado,
  onModoChange
}: TransactionModeFilterProps) {
  const modos = [
    { id: 'VENTA', label: 'Venta' },
    { id: 'ALQUILER', label: 'Alquiler' },
    { id: 'ANTICRETO', label: 'Anticrético' }
  ]

  const handleToggle = (id: string) => {
    const nuevos = modoSeleccionado.includes(id)
      ? modoSeleccionado.filter((m) => m !== id)
      : [...modoSeleccionado, id]
    onModoChange(nuevos)
  }

  return (
    // CAMBIO CLAVE: -mx-4 estira el contenedor hacia los bordes del cuadro blanco
    // flex-nowrap prohíbe terminantemente el salto de línea
    <div className="flex flex-nowrap justify-between items-center w-full -mx-4 px-4 mb-4 gap-1">
      {modos.map((modo) => {
        const isChecked = modoSeleccionado.includes(modo.id)

        return (
          <label
            key={modo.id}
            // whitespace-nowrap evita que la palabra se parta a la mitad
            className="flex items-center gap-1 cursor-pointer whitespace-nowrap"
          >
            <div className="relative inline-flex items-center justify-center shrink-0">
              <input
                type="checkbox"
                name="modoTransaccion"
                value={modo.id}
                checked={isChecked}
                onChange={() => handleToggle(modo.id)}
                // Cuadritos un pelo más chicos (w-3.5) para ganar espacio vital
                className={`
                  w-3.5 h-3.5 rounded border cursor-pointer appearance-none transition-all duration-200
                  ${isChecked ? 'bg-[#d97706] border-[#d97706]' : 'bg-white border-stone-400'}
                `}
              />

              {isChecked && (
                <svg
                  className="absolute w-2.5 h-2.5 pointer-events-none"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#000000"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            {/* Reducimos ligeramente el texto en móvil extremo para que entre sí o sí */}
            <span className="text-[10px] xs:text-[12px] sm:text-sm text-stone-900 font-medium leading-none">
              {modo.label}
            </span>
          </label>
        )
      })}
    </div>
  )
}
