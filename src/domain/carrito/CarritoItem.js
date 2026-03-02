/* 
CarritoItem {
  tipo: "articulo" | "articulo-personalizado" | "pizza-entera" | "pizza-mitades"

  articuloId?: number      // si viene de catálogo
  nombre: string
  tamaño: "Pequeña" | "Mediana" | "Grande" | null
  cantidad: number

  precioBase: number
  precioExtras: number
  precioTotal: number

  ingredientesExtras: {
    id: number
    nombre: string
    cantidad: number
  }[]

  ingredientesQuitados: {
    id: number
    nombre: string
  }[]

  mitades?: {
    mitadA: SubItem
    mitadB: SubItem
  }
}
 */
