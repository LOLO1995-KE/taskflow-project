# Prompt Engineering aplicado al desarrollo

Aquí recopilaré los prompts que he usado durante el desarrollo de TaskFlow, clasificados por técnica:
- Prompts con rol (actúa como...).
- Few-shot prompting (con ejemplos).
- Razonamiento paso a paso.
- Restricciones claras.

Explicaré por qué cada prompt funcionó bien y qué mejoras obtuve.
# Prompt Engineering aplicado al desarrollo

Aquí recopilaré los prompts que he usado durante el desarrollo de TaskFlow, clasificados por técnica:
- Prompts con rol (actúa como...).
- Few-shot prompting (con ejemplos).
- Razonamiento paso a paso.
- Restricciones claras.

Explicaré por qué cada prompt funcionó bien y qué mejoras obtuve.

---

## 1. Rol (actúa como…)

**Prompt:**  
> Actúa como un desarrollador senior de JavaScript. Revisa la función `applyAllFilters` y sugiere mejoras de legibilidad y mantenibilidad. Explica por qué las recomiendas.

**Resultado:**  
La IA propuso separar los filtros en funciones independientes (`filterByMain`, `filterByCategory`, `filterByStatus`, `filterBySearch`) y añadir JSDoc. El código quedó más modular y fácil de testear.

**Por qué funciona:**  
Al asignar un rol específico, la IA se enfoca en buenas prácticas y patrones propios de un experto, no solo en corregir errores.

---

## 2. Few-shot (con ejemplos)

**Prompt:**  
> Quiero una función que filtre tareas por prioridad. Ejemplo:  
> `filterByPriority(tasks, 'high')` → devuelve tareas con prioridad alta.  
> `filterByPriority(tasks, 'medium')` → devuelve tareas con prioridad media.  
> Ahora implementa `filterByPriority` siguiendo el mismo patrón.

**Resultado:**  
Generó una función que itera sobre el array y devuelve las tareas cuya prioridad coincide con el argumento, usando `filter`.

**Por qué funciona:**  
Dar ejemplos concretos ayuda a la IA a inferir la estructura esperada sin necesidad de explicar cada detalle.

---

## 3. Razonamiento paso a paso

**Prompt:**  
> Piensa paso a paso: ¿cómo implementarías un botón que marque todas las tareas como completadas? Explica la lógica antes de escribir el código.

**Resultado:**  
La IA describió:  
1. Verificar si hay tareas.  
2. Comprobar si todas ya están completadas para decidir si marcarlas o desmarcarlas.  
3. Usar `forEach` para modificar el estado.  
4. Guardar en `localStorage` y re-renderizar.  
Luego escribió `markAllAsCompleted` con esa lógica.

**Por qué funciona:**  
El razonamiento previo evita que la IA genere código directamente sin considerar casos borde.

---

## 4. Restricciones claras

**Prompt:**  
> Implementa `deleteTask` sin usar `filter`. Usa un bucle `for` tradicional y `splice`. Además, debe pedir confirmación antes de eliminar.

**Resultado:**  
La IA generó un bucle `for` inverso (para no alterar índices) que busca el índice de la tarea y la elimina con `splice`, envuelto en un `confirm`.

**Por qué funciona:**  
Limitar las herramientas disponibles obliga a la IA a pensar en una solución más manual, pero a menudo más educativa.

---

## 5. Prompts mixtos (rol + restricciones)

**Prompt:**  
> Actúa como un instructor de JavaScript. Enséñame cómo funciona el hoisting usando ejemplos con `var`, `let`, `const` y funciones. Utiliza un tono didáctico y evita jerga innecesaria.

**Resultado:**  
Recibí una explicación clara con ejemplos, tablas comparativas y la recomendación de evitar `var` en código moderno.

**Por qué funciona:**  
Combinar rol y restricciones de formato produce respuestas adaptadas a una audiencia específica.

---

## 6. Prompt con formato de salida específico

**Prompt:**  
> Genera la documentación JSDoc para la función `createTaskCard`. Incluye descripción, `@param`, `@returns` y un ejemplo de uso en un bloque de código.

**Resultado:**  
La IA devolvió un comentario JSDoc completo con la estructura pedida, listo para copiar y pegar.

**Por qué funciona:**  
Especificar el formato evita tener que reescribir manualmente la documentación.

---

## 7. Refactorización con IA

**Prompt:**  
> Refactoriza `renderFilteredTasks` para que el mensaje de “no hay tareas” esté en una función separada llamada `showEmptyMessage`. Mantén la funcionalidad exacta.

**Resultado:**  
Extrajo el bloque de creación del mensaje vacío a una nueva función, mejorando la legibilidad.

**Por qué funciona:**  
Pedir cambios estructurales pequeños ayuda a la IA a generar código limpio sin alterar la lógica.

---

## 8. Depuración con IA

**Prompt:**  
> El botón de eliminar no funciona después de aplicar filtros. Revisa `addDeleteListeners` y `renderFilteredTasks` y dime qué puede estar fallando.

**Resultado:**  
La IA señaló que los listeners se añadían antes de que los elementos existieran en el DOM y sugirió llamarlos después de insertar las tareas.

**Por qué funciona:**  
Al describir el problema contextualmente, la IA puede diagnosticar errores comunes.

---

## 9. Generación de pruebas

**Prompt:**  
> Escribe un caso de prueba simple para `addTask`. Supón que `tasks` es un array vacío y que `taskInput.value = 'Nueva tarea'`. Muestra cómo quedaría el array después de ejecutar la función.

**Resultado:**  
Generó un bloque de código con la simulación y el resultado esperado, útil para entender el comportamiento.

**Por qué funciona:**  
Pedir pruebas ayuda a validar la lógica antes de implementar.

---

## 10. Explicación de código legacy

**Prompt:**  
> Explica qué hace la función `resetFilters` en términos simples. ¿Por qué se usa `document.querySelectorAll` y `classList`?

**Resultado:**  
La IA desglosó la función línea por línea y explicó la manipulación de clases para restablecer los filtros visuales.

**Por qué funciona:**  
Solicitar explicaciones ayuda a comprender código que uno mismo escribió hace tiempo.

---

## Conclusión

Las técnicas de prompt engineering permiten obtener respuestas más precisas y adaptadas al contexto. Definir un rol, dar ejemplos, pedir razonamiento paso a paso o imponer restricciones mejora notablemente la calidad del código generado y facilita el aprendizaje.