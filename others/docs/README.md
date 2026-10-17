# React + TypeScript + Vite
This is a project with the mission of be the frontend of the project "Electromagnetismo". 
Here is the majority of the UI logic, but sometimes we need to call the backend to get some data. 
The backend is a FastAPI project. 
Here is the explanation of the "Electromagnetismo" project:

# Proyecto: Diseño computacional y optimización de metamateriales electromagnéticos
### Objetivo final
> *Desarrollar un sistema computacional capaz de diseñar y optimizar una estructura
electromagnética para controlar la propagación de ondas electromagnéticas.*
# 🟦 FASE 1 — Fundamentos y prerrequisitos
### Objetivo
Adquirir los conocimientos y herramientas necesarios para construir una simulación
electromagnética confiable.
### 1. Electromagnetismo
Necesitan comprender:
* Campo eléctrico 𝐸
* Campo magnético 𝐵
* Ondas electromagnéticas
* Frecuencia → 𝑓
* Longitud de onda → λ
* Velocidad de propagación
* Polarización
* Reflexión
* Transmisión
* Interferencia
* Resonancia
* Permitividad ϵ
* Permeabilidad µ
* Conductividad σ
Y especialmente:
∇×E=−∂B/∂t
∇×H=J+ ∂D/∂t
Es decir, las *ecuaciones de Maxwell*.
### 2. Física de metamateriales
Investigar:
* ¿Qué es un metamaterial?
* ¿Por qué su estructura puede modificar una onda electromagnética?
* ¿Qué es una celda unitaria?
* ¿Qué significa una respuesta electromagnética resonante?
* ¿Qué diferencia hay entre un material convencional y un metamaterial?
### 3. Matemáticas
Principalmente:
* funciones sinusoidales;
* números complejos;
* vectores y matrices;
* derivadas;
* ecuaciones diferenciales;
* discretización numérica.
### Resultado de la Fase 1
Poder explicar:
> *"Qué estamos simulando, por qué una estructura puede modificar una onda
electromagnética y qué ecuaciones vamos a resolver."*
*Duración estimada: 5–7 días.*
---
# 🟩 FASE 2 — Construcción del simulador electromagnético
### Objetivo
Crear un programa capaz de representar *una onda electromagnética propagándose e
interactuando con una estructura*.
Aquí empieza el verdadero proyecto computacional.
---
### 1. Crear el espacio de simulación
Por ejemplo:
text
┌────────────────────────────────────────────┐
│ │
│ → → → → → → → → → │
│ → → → → → → → → → ████ ████ │
│ → → → → → → → → → ████ ████ │
│ → → → → → → → → → ████ ████ │
│ │
└────────────────────────────────────────────┘
El computador representa el espacio mediante una *rejilla de puntos*.
---
### 2. Simular la onda
Utilizar una técnica numérica como:
*FDTD — Finite-Difference Time-Domain*
El programa calcula cómo evoluciona el campo electromagnético:
E(x,y,t)
y
H(x,y,t)H(x,y,t)
en pequeños intervalos de espacio y tiempo.
---
### 3. Introducir el metamaterial
Crear una estructura periódica:
text
○ ○ ○ ○ ○
○ ○ ○ ○ ○
○ ○ ○ ○ ○
○ ○ ○ ○ ○
Después experimentar con diferentes geometrías.
Por ejemplo:
text
Diseño A Diseño B Diseño C
┌───┐ ┌─┐ ╭───╮
│ │ │ │ │ │
└───┘ └─┘ ╰───╯
---
### 4. Visualización
Mostrar en tiempo real:
* propagación de la onda;
* intensidad del campo;
* reflexión;
* transmisión;
* zonas de resonancia.
Por ejemplo:
text
INCIDENTE
→→→→→→→→→→→→
METAMATERIAL
█ █ █ █ █ █ █
←←← reflexión
→→→ transmisión
### 5. Validación
Comparar casos simples:
*Caso 1:* espacio vacío
*Caso 2:* material convencional
*Caso 3:* estructura periódica
Y comprobar que los resultados tienen sentido físico.
### Resultado de la Fase 2
> *Un simulador electromagnético funcional capaz de representar la interacción entre una
onda y una estructura.*
*Duración estimada: 1–2 semanas.*
---
# 🟨 FASE 3 — Investigación y análisis del metamaterial
### Objetivo
Determinar *qué características geométricas producen determinadas respuestas
electromagnéticas*.
---
## 1. Definir variables
a=tamanño de la celda
d=separacion
w=ancho de la estructura
f=frecuencia
## 2. Ejecutar muchos experimentos
Por ejemplo:
| Diseño | 𝑎 | 𝑑 | 𝑤 | Frecuencia | Transmisión |
| ------ | ----: | ----: | ----: | ---------: | ----------: |
| A | 10 | 2 | 1 | 8 GHz | 82% |
| B | 10 | 2 | 2 | 8 GHz | 61% |
| C | 12 | 2 | 2 | 8 GHz | 43% |
| D | 14 | 3 | 2 | 8 GHz | 29% |
(Estos valores son solamente ilustrativos; los resultados reales saldrán de la simulación.)
---
## 3. Crear curvas de respuesta
Por ejemplo:
T(f)
donde 𝑇 representa la transmisión.
Se podría descubrir algo parecido a:
text
Transmisión
1.0 |████████████████
|████████████
0.6 |████████
|████
0.2 |██
|
+--------------------
5 7 9 11 13 GHz
Una caída pronunciada podría indicar una región de fuerte interacción/resonancia.
---
## 4. Crear una función objetivo
Este paso prepara directamente la Fase 4.
Por ejemplo:
> Queremos encontrar una estructura que minimice la transmisión alrededor de una
frecuencia determinada.
Entonces definimos:
F = T(f_0)
y el computador intentará encontrar geometrías que hagan 𝐹 pequeño.
También construir objetivos más complejos:
F=w_1T+w_2R+w_3C
donde los términos representan diferentes características que se quieran optimizar.
---
### Resultado de la Fase 3
> *Un conjunto de datos que relaciona la geometría del metamaterial con su
comportamiento electromagnético y una función matemática que define qué significa
"optimizar".*
*Duración estimada: 1 semana.*
---
# 🟥 FASE 4 — Diseño y optimización computacional
Esta es la fase que da nombre al proyecto.
## 🎯 Objetivo final
> *Desarrollar un sistema computacional capaz de diseñar y optimizar una estructura
electromagnética.*
Ya no se prueba manualmente cada diseño.
Será el *computador*.
---
## 1. Generador de estructuras
El programa crea automáticamente diferentes geometrías:
text
Diseño 1
████████
Diseño 2
██ ██
██████
Diseño 3
█ █
█ ██ █
█ █
---
## 2. Simulación automática
Cada diseño pasa por el simulador:
text
DISEÑO
↓
SIMULACIÓN EM
↓
TRANSMISIÓN
↓
FUNCIÓN OBJETIVO
---
## 3. Algoritmo de optimización
### Búsqueda sistemática
El computador prueba:
text
a = 5, 6, 7, 8, ... 20
d = 1, 2, 3, ... 10
w = 1, 2, 3, ... 8
Y compara todos los resultados.
Después:
### Algoritmo genético
text
100 DISEÑOS
↓
SIMULACIÓN
↓
EVALUAR RESULTADOS
↓
SELECCIONAR MEJORES
↓
MUTACIÓN
↓
100 NUEVOS
↓
REPETIR
↓
DISEÑO ÓPTIMO
Esto sería especialmente interesante para la presentación.
---
# 🏆 El producto final
Al terminar, podrían tener una interfaz parecida a:
text
╔════════════════════════════════════════════╗
║ OPTIMIZADOR DE METAMATERIALES ║
╠════════════════════════════════════════════╣
║ Frecuencia objetivo: 10 GHz ║
║ ║
║ Algoritmo: Genético ║
║ ║
║ Generación: 47 / 50 ║
║ ║
║ Mejor diseño encontrado: ║
║ ║
║ ┌───────┐ ║
║ │ ┌───┐ │ ║
║ │ │ │ │ ║
║ │ └───┘ │ ║
║ └───────┘ ║
║ ║
║ Transmisión: 4.7 % ║
║ ║
║ [ SIMULAR ] [ OPTIMIZAR ] ║
╚════════════════════════════════════════════╝
Y mostrar al jurado:
> *"No diseñamos esta estructura manualmente. El sistema generó diferentes candidatos,
simuló su comportamiento electromagnético y seleccionó iterativamente las configuraciones
que cumplían mejor nuestro objetivo."*
Ese sería el punto culminante del proyecto.
---
# 🧩 El proyecto completo quedaría así
text
FASE 1
PRERREQUISITOS
│
▼
Electromagnetismo
Matemáticas
Metamateriales
Programación
│
▼
FASE 2
SIMULADOR EM
│
▼
Ondas + Maxwell + FDTD
│
▼
FASE 3
INVESTIGACIÓN
│
▼
Geometría → Respuesta EM
│
▼
Función objetivo
│
▼
FASE 4
OPTIMIZACIÓN
│
▼
Generación de diseños
↓
Simulación
↓
Evaluación
↓
Selección
↓
Nuevos diseños
↓
🏆 ESTRUCTURA OPTIMIZADA
### ⏱️ Duración total propuesta
*4–6 semanas, trabajando aproximadamente **1–2 horas al día, 4–5 días por semana*.