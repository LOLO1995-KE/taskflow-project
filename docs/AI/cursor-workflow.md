### Autocompletado de comentarios
Escribí un comentario inicial en la función `renderTasks` y al pulsar `Tab`, Cursor me sugirió comentarios adicionales para cada bloque del código. Esto me ayudó a documentar rápidamente el propósito de cada parte sin tener que escribirlos manualmente.

## 7. Experimentos con IA en programación

### 7.1 Problemas de programación pequeños

#### Experimento 1: Invertir una cadena (sin `reverse()`)

Sin IA (manual) 

Escribí la función manualmente usando un bucle `for` inverso. Tiempo: 2 minutos.  
```javascript
function reverseString(str) {
    let reversed = '';
    for (let i = str.length - 1; i >= 0; i--) {
        reversed += str[i];
    }
    return reversed;
}

Con IA:
Prompt: "Escribe una función en JavaScript que invierta una cadena sin usar reverse(). Incluye un ejemplo de uso."
Respuesta (ChatGPT en Cursor):

javascript
function reverseString(str) {
    let result = '';
    for (let char of str) {
        result = char + result;
    }
    return result;
}
// Ejemplo: reverseString("hola") → "aloh"
Tiempo: 30 segundos (incluyendo copiar y probar).

Comparación:
Ambos códigos son correctos. El de IA usa un enfoque ligeramente diferente (for...of). La versión manual fue igual de eficiente, pero la IA ahorró tiempo y añadió comentarios.

Experimento 2: Factorial

Sin IA (manual):
Implementé una función recursiva. Tiempo: 1 minuto.

javascript
function factorial(n) {
    if (n === 0 || n === 1) return 1;
    return n * factorial(n - 1);
}
Con IA:
Prompt: "Escribe una función factorial en JavaScript. Versión iterativa y recursiva. Explica cuál es más eficiente."
Respuesta:

javascript
// Recursiva
function factorialRec(n) {
    return n <= 1 ? 1 : n * factorialRec(n - 1);
}
// Iterativa
function factorialIter(n) {
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
}
Tiempo: 1 minuto (incluyendo leer la explicación).

Comparación:
La IA ofreció ambas versiones y una explicación de eficiencia. La versión manual fue más rápida de escribir, pero la IA aportó valor educativo.

Experimento 3: Eliminar duplicados de un array
Sin IA (manual):
Usé filter con índice. Tiempo: 1 minuto.

javascript
function unique(arr) {
    return arr.filter((item, index) => arr.indexOf(item) === index);
}
Con IA:
Prompt: "Escribe una función que elimine duplicados de un array en JavaScript. Da tres formas diferentes."
Respuesta:

javascript
// 1. Con Set
const uniqueSet = arr => [...new Set(arr)];
// 2. Con filter
const uniqueFilter = arr => arr.filter((v, i, a) => a.indexOf(v) === i);
// 3. Con reduce
const uniqueReduce = arr => arr.reduce((acc, cur) => acc.includes(cur) ? acc : [...acc, cur], []);
Tiempo: 2 minutos (leyendo las tres opciones).

Comparación:
La IA proporcionó múltiples enfoques, lo que enriqueció mi conocimiento. El manual fue más rápido si solo necesitaba una solución.

7.2 Tareas relacionadas con TaskFlow
Experimento 4: Refactorizar applyAllFilters con IA
Sin IA:
Intenté refactorizar manualmente separando los filtros en funciones. Me llevó unos 15 minutos y el código quedó funcional pero con duplicación de lógica de búsqueda.

Con IA:
Prompt: "Refactoriza la función applyAllFilters de TaskFlow separando cada filtro en su propia función (filterByMain, filterByCategory, filterByStatus, filterBySearch). Mantén la funcionalidad exacta."
La IA generó las cuatro funciones auxiliares y reescribió applyAllFilters para llamarlas en cadena. Tiempo: 5 minutos (incluyendo revisión y corrección de un </button> suelto).

Comparación:
La IA redujo el tiempo a un tercio y produjo un código más modular y legible. Tuve que revisar manualmente para corregir un error sintáctico menor.

Experimento 5: Añadir JSDoc a createTaskCard
Sin IA:
Habría escrito los comentarios JSDoc manualmente, estimado 5 minutos.

Con IA:
Prompt: "Añade un comentario JSDoc completo para la función createTaskCard. Incluye descripción, @param, @returns y un ejemplo de uso."
Respuesta generada en 10 segundos, lista para copiar y pegar.

Comparación:
La IA completó la tarea en una fracción del tiempo y con una documentación consistente.

Experimento 6: Generar prueba unitaria para addTask
Sin IA:
Escribir una prueba manual con aserciones básicas tomaría unos 3 minutos.

Con IA:
Prompt: "Escribe un caso de prueba simple para addTask. Supón que tasks es un array vacío y taskInput.value = 'Nueva tarea'. Muestra cómo quedaría el array después de ejecutar la función."
La IA generó un fragmento de prueba con comentarios explicativos en menos de 30 segundos.

Comparación:
La IA aceleró la escritura de pruebas y ayudó a pensar en casos límite.

7.3 Conclusiones de los experimentos
Productividad: La IA redujo significativamente el tiempo en tareas repetitivas (documentación, código boilerplate, pruebas).

Calidad: El código generado fue generalmente correcto y bien estructurado, pero requirió revisión manual para evitar errores menores.

Comprensión: Pedir explicaciones paso a paso mejoró mi entendimiento de funciones complejas.

Riesgos: Depender ciegamente de la IA puede llevar a introducir bugs o código ineficiente; siempre es necesario revisar.





