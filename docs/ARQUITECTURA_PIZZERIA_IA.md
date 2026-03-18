ARQUITECTURA DEFINITIVA – APP PIZZERÍA
1️⃣ MODELO DE DATOS (Backend)
🔹 articulos

Campos clave:

id

nombre

descripcion

tipo_producto_id (nullable)

personalizable (boolean)

publicado

orden

hora_inicio_venta

hora_fin_venta

imagen

Reglas:

Si personalizable = true → debe existir tipo_producto_id

Si personalizable = false → tipo_producto_id puede existir o no

🔹 tipo_producto

Define compatibilidad de ingredientes.

NO define:

tamaños

precios

personalizable

Ejemplos:

Pizza

Bebida

Postre

🔹 tamanos (tabla global)

Ejemplos:

Pequeña

Mediana

Grande

Único

No dependen de tipo_producto.

🔹 articulo_precios

Relación:

articulo_id

tamano_id

precio

Reglas:

Todos los precios base vienen exclusivamente de esta tabla

Nunca guardar precio directo en articulos

🔹 articulo_ingredientes (pivot)

articulo_id

ingrediente_id

modo ("base" | "extra")

incluido_por_defecto (bool)

obligatorio (bool)

max_cantidad (int)

🔹 ingrediente_precios

ingrediente_id

tipo_producto_id

tamano_id

precio

Regla:
El precio del ingrediente depende de:

tipo_producto_id

tamano_id

2️⃣ CONTRATO API
GET /shop/articulos/{id}

Devuelve:

{
  "id": 1,
  "tipo_producto_id": 1,
  "nombre": "Pizza Margarita",
  "descripcion": "...",
  "imagen": "...",
  "personalizable": true,
  "tamanos": [
    { "id": 1, "nombre": "Pequeña", "precio": 7 },
    { "id": 2, "nombre": "Mediana", "precio": 9 }
  ],
  "ingredientes": {
    "Quesos": [
      {
        "id": 2,
        "nombre": "Mozzarella",
        "modo": "base",
        "incluido": true,
        "obligatorio": true,
        "max_cantidad": 3,
        "precio_por_tamano": {
          "1": 0.70,
          "2": 1.00,
          "3": 1.50
        }
      }
    ]
  }
}

Reglas:

precio_por_tamano ya viene filtrado por tipo_producto_id del artículo

Solo incluye tamaños válidos del artículo

No se envía array de precios crudo

3️⃣ FRONTEND – REGLAS INQUEBRANTABLES
🔹 Precio base

Siempre:

precioBase = tamanoSeleccionado.precio

Nunca recalcular manualmente.
Nunca recargos hardcodeados.

🔹 Precio ingrediente

Siempre:

precio = ingrediente.precio_por_tamano[tamanoId]

Nunca por string.
Nunca por heurística.

🔹 Cálculo extras
modo base:
  solo se paga cantidad > 1

modo extra:
  se paga cantidad completa
4️⃣ HOOKS DEFINITIVOS
useIngredientesConPrecios

Cache 10 minutos

keepPreviousData: true

refetchOnWindowFocus: false

Soporta prefetch para mitades

usePrecios

Funciones:

toNum

formatEUR

getPrecioIngrediente(ingrediente, tamanoId)

calcularExtras(ingredientes, tamanoId)

Trabaja exclusivamente con tamano_id.

5️⃣ CARRITO – ESTRUCTURA ESTÁNDAR
🍕 Pizza personalizada
{
  "tipo": "pizza-personalizada",
  "articulo_id": 1,
  "tamano_id": 2,
  "precio_base": 9,
  "precio_extras": 2.5,
  "precio_total": 11.5,
  "ingredientes": {
    "extras": [
      { "id": 8, "cantidad": 2 }
    ],
    "quitados": [
      { "id": 2 }
    ]
  }
}
🍕 Pizza por mitades
{
  "tipo": "pizza-mitades",
  "tamano_id": 2,
  "precio_total": 14.5,
  "mitades": {
    "A": {
      "articulo_id": 1,
      "ingredientes": { ... }
    },
    "B": {
      "articulo_id": 3,
      "ingredientes": { ... }
    }
  }
}
6️⃣ ARTÍCULO PLANTILLA – CREA TU PIZZA

Debe existir en BD:

nombre: "Crea tu pizza"

tipo_producto_id = Pizza

personalizable = true

publicado = false

articulo_ingredientes con:

Mozzarella (incluido)

Tomate (incluido)

Orégano (incluido)

No se crea lógica especial en frontend.
Se trata como cualquier otro artículo.

7️⃣ COSAS PROHIBIDAS

❌ No mezclar precio directo en articulos
❌ No usar tipo_producto para decidir tamaños
❌ No usar strings de tamaño para calcular precio
❌ No hardcodear recargos
❌ No confiar en precio_total del frontend en backend

8️⃣ VALIDACIÓN FUTURA (OBLIGATORIA)

Cuando se cree pedido:

Recalcular precio en backend

Validar tamano_id pertenece al artículo

Validar ingredientes pertenecen al artículo

Validar cantidades <= max_cantidad

ESTADO ACTUAL DEL PROYECTO

✔ Backend limpio
✔ Contrato API limpio
✔ Hook datos optimizado
✔ Hook precios alineado
✔ ModalPersonalizar funcionando con precio_por_tamano

Siguiente fase:
→ Sistema de MITADES correctamente estructurado.