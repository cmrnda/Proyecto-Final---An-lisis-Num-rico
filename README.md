# Proyecto Final 
# Analisis Numerico – Punto de Equilibrio con Metodos de Raices

**Autor:** Carlos Manuel Miranda Aguirre  
**CI:** 13759486  
**RU:** 1825954  
**Carrera:** Informatica – UMSA  
**Materia:** Metodos Numericos

---

## 1. Objetivo de la aplicacion

Esta aplicacion web muestra, de forma practica e interactiva, como distintos **metodos numericos para raices de ecuaciones** resuelven el mismo problema real:

> Hallar el **punto de equilibrio** de una empresa, es decir, la cantidad de unidades donde el beneficio es igual a cero.

La idea es que el estudiante pueda:
- Ver la **funcion de beneficio**.
- Aplicar **varios metodos de raices** sobre el mismo modelo.
- Comparar **resultados, errores y numero de iteraciones**.
- Visualizar todo en **graficas grandes y claras**.

---

## 2. Modelo matematico usado

Se usa un modelo sencillo de empresa:

- Precio de venta:
  \[
  precio(x) = P_0 - k x
  \]

- Ingreso total:
  \[
  ingreso(x) = precio(x)\,x
  \]

- Costo total:
  \[
  costo(x) = c_f + c_v x
  \]

- Beneficio:
  \[
  beneficio(x) = ingreso(x) - costo(x)
  \]

El **punto de equilibrio** es el valor de \(x\) tal que:

\[
beneficio(x) = 0
\]

Sobre esta misma funcion se aplican todos los metodos numericos.

---

## 3. Metodos numericos implementados

La pagina implementa y compara los siguientes metodos para encontrar la raiz de la funcion beneficio(x):

1. **Biseccion**  
   - Usa un intervalo \([a,b]\) donde la funcion cambia de signo.  
   - Va partiendo el intervalo a la mitad hasta acercarse a la raiz.

2. **Falsa posicion**  
   - Tambien usa un intervalo \([a,b]\), pero en lugar de la mitad usa una recta secante.  
   - Suele converger mas rapido que biseccion en muchos casos.

3. **Punto fijo (iteracion funcional)**  
   - Reescribe la ecuacion como \( x = g(x) \).  
   - Genera una sucesion \(x_{k+1} = g(x_k)\) hasta que converja.

4. **Newton**  
   - Usa derivada de la funcion.  
   - Iteracion: \( x_{k+1} = x_k - f(x_k)/f'(x_k) \).  
   - Converge muy rapido si se escoge bien el punto inicial.

5. **Secante**  
   - Parecido a Newton, pero **no necesita derivada**.  
   - Usa dos puntos iniciales y construye secantes.

Ademas, se calcula la **raiz exacta teorica** usando la formula cuadratica (porque el modelo se reduce a un polinomio de grado 2). Esta raiz se usa como referencia para medir los errores.

---

## 4. Estructura del proyecto

El repositorio contiene tres archivos principales:

- `index.html`  
  Estructura de la pagina web. Contiene el formulario de entrada, tarjetas de texto y contenedores de las graficas.

- `styles.css`  
  Diseno y estilo de la interfaz: tema claro, tarjetas, fuentes grandes, botones, leyendas y tamanos de las graficas.

- `script.js`  
  Lógica de la aplicacion:
  - Definicion del modelo de beneficio.
  - Implementacion de los cinco metodos numericos.
  - Calculo de la raiz exacta.
  - Construccion de tablas y errores.
  - Dibujo animado de las dos graficas.

No se usan librerias externas: todo esta en JavaScript puro, HTML y CSS.

---

## 5. Como usar la pagina

1. Abrir `index.html` en el navegador o acceder mediante GitHub Pages.  
2. En el panel **Datos del problema**, ingresar:
   - Precio base `P0`.
   - Parametro de demanda `k`.
   - Costo variable `cv`.
   - Costo fijo `cf`.
3. En **Parametros numericos**, configurar:
   - Intervalo \([a,b]\) para los metodos de intervalo.
   - Valores iniciales para punto fijo, Newton y secante.
   - Tolerancia y numero maximo de iteraciones.
4. Pulsar **“Calcular todos los metodos”**.

La pagina muestra:

- El **punto de equilibrio principal** (metodo mas preciso para esos datos).  
- Una **tabla comparativa** con:
  - Raiz aproximada de cada metodo.
  - Numero de iteraciones.
  - Error absoluto frente a la raiz exacta.
- Una **tabla de iteraciones** del metodo de biseccion (a_k, b_k, c_k, f(c_k)).

Tambien se puede usar el boton **“Ejemplo rapido”** para cargar valores de ejemplo ya configurados.

---

## 6. Descripcion de las graficas

La interfaz incluye dos graficas grandes:

### Grafica 1 – Beneficio y raices

- Eje horizontal: cantidad producida \(x\) (unidades).  
- Eje vertical: \(beneficio(x)\).  
- Se dibuja:
  - Curva de beneficio.
  - Eje \(y=0\) (punto donde el beneficio cambia de signo).
  - Punto de la **raiz exacta teorica**.
  - Puntos de las raices aproximadas de:
    - Biseccion  
    - Falsa posicion  
    - Punto fijo  
    - Newton  
    - Secante  

Sirve para ver como cada metodo termina en el mismo punto de equilibrio sobre la funcion original.

### Grafica 2 – Aproximaciones por iteracion

- Eje horizontal: numero de iteracion \(k\).  
- Eje vertical: valor de la aproximacion \(x_k\).  
- Cada metodo se representa con una curva de color diferente.

Aqui se ve:

- Que metodos se acercan mas rapido a la raiz.  
- Si algun metodo oscila o converge mas lento.  
- El comportamiento completo de las sucesiones generadas por cada metodo.

---

## 7. Interpretacion para la materia

Esta aplicacion muestra, en un solo problema:

- Como se **plantea** una raiz de ecuacion a partir de un modelo practico (punto de equilibrio).  
- Como cada **metodo de analisis numerico** tiene:
  - Diferente velocidad de convergencia.
  - Diferente cantidad de iteraciones.
  - Diferente error frente a la solucion exacta.
- Como usar una **herramienta informatica** (web) para:
  - Probar parametros.
  - Ver resultados numericos.
  - Interpretar graficas.

El objetivo principal es que el estudiante pueda **explicar y defender** los metodos, no solo ver el resultado final, mostrando ademas tablas y graficas claras para el docente.
