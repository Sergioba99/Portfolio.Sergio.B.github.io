# Proyectos del portfolio

Documento de contexto para IA con RAG. Resume los proyectos visibles en el portfolio y su informacion esencial.

## Resumen rapido

- **TFG**: base de datos y entorno grafico para gestionar datos de una simulacion de transporte ferroviario.
- **RepliTal**: proyecto de IA para predecir presets de Vital a partir de audio.
- **Fuzzy-Library**: libreria Python para modelado y evaluacion de sistemas de logica difusa.
- **TransportMe**: plugin de Spigot para gestion de teletransporte en servidores Minecraft.
- **DS3SaveBackup**: utilidad para copias de seguridad de partidas de Dark Souls 3.
- **PromptTemplateLibrary**: gestor de plantillas YAML para LLMs, en desarrollo.
- **RepliTal Avatar**: avatar virtual de presentacion para explicar RepliTal en video.
- **Fan Control**: hub de control climatico con ESP32, DHT11 y RF 433 MHz, en expansion.
- **Chatbot del portfolio**: chatbot integrado en la web como demostracion de uso de Chatbase.

## Lista de proyectos

### 1. TFG

- **Titulo**: Diseño e implementación de una base de datos y entorno gráfico para la gestión de datos en la simulación de transporte ferroviario
- **Estado**: completado / publicado en GitHub
- **Tags**: TFG, Python, SQLite, Tkinter, YAML, CSV, SQL, modelado de datos
- **Resumen**: Base de datos y entorno grafico en Python y SQLite para gestionar datos de una simulacion ferroviaria, con importacion, visualizacion y reconstruccion de archivos originales.
- **Reto**: Persistencia estructurada y consultas eficientes para datos generados por el simulador, con una interfaz accesible para perfiles no tecnicos.
- **Solucion**: Ingesta y parseo de ficheros YAML de configuracion y CSV de resultados, diseno del esquema relacional en SQLite y desarrollo de una interfaz con Tkinter.
- **Funciones clave**:
  - Importacion de datos desde archivos del simulador.
  - Visualizacion y filtrado de registros.
  - Reconstruccion de archivos originales a partir de la base de datos.
  - Pipeline de datos documentado visualmente.
- **Tecnologias destacadas**: Python, SQLite, Tkinter, SQL, YAML, CSV.
- **Enlace publico**: GitHub del proyecto.

### 2. RepliTal

- **Titulo**: RepliTal - Síntesis Inversa con IA: Predicción de Presets de Vital desde Audio
- **Estado**: en desarrollo
- **Tags**: PyTorch, Audio ML, espectrogramas Mel, IA
- **Resumen**: Proyecto de inteligencia artificial para predecir presets de Vital a partir de audio usando espectrogramas y una CNN de regresion multisalida.
- **Reto**: Convertir un fragmento de audio en parametros de sintesis utiles y automaticos para el sintetizador Vital.
- **Solucion**: Generacion automatizada de miles de muestras de audio vinculadas a parametros reales, transformacion a espectrogramas y entrenamiento del modelo con PyTorch.
- **Funciones clave**:
  - Generacion automatizada de datos.
  - Asociacion entre audio y parametros de sintesis.
  - Entrenamiento supervisado con PyTorch.
  - Interfaz para cargar sonido y generar presets.
- **Tecnologias destacadas**: Python, PyTorch, IA aplicada al audio, Vital.

### 3. Fuzzy-Library

- **Titulo**: Fuzzy-Library: libreria Python para modelado y evaluacion de sistemas de logica difusa
- **Estado**: en desarrollo
- **Tags**: Python, logica difusa, Mamdani, TSK, Cumulative TSK, parser de reglas, testing
- **Resumen**: Libreria modular en Python para definir variables linguisticas, conjuntos difusos, reglas y motores de inferencia para sistemas difusos.
- **Reto**: Concentrar la logica de sistemas difusos en una libreria reutilizable y mantenible.
- **Solucion**: Implementacion de conjuntos difusos trapezoidales, proposiciones atomicas y compuestas, parser de reglas IF...THEN y evaluacion de reglas para varios modelos de inferencia.
- **Funciones clave**:
  - Parser de reglas.
  - Evaluacion de modelos Mamdani, TSK y Cumulative TSK.
  - Evaluador de formulas para consecuentes TSK.
  - Tests unitarios sobre parser, tipos y componentes base.
- **Tecnologias destacadas**: Python, logica difusa, pruebas unitarias.

### 4. TransportMe

- **Titulo**: TransportMe - Plugin de Gestion de Teletransporte para Servidores Minecraft
- **Estado**: publicado
- **Tags**: Java, Spigot API, SpigotMC, OOP
- **Resumen**: Plugin de Spigot en Java para gestionar teletransporte en servidores Minecraft con puntos nombrados, permisos y persistencia de datos.
- **Reto**: Implementar un sistema de teletransporte configurable y robusto para servidores Minecraft.
- **Solucion**: Plugin orientado a eventos con persistencia de puntos de teletransporte y sistema de comandos con gestion de permisos por rol.
- **Funciones clave**:
  - Puntos de teletransporte nombrados.
  - Permisos granulares.
  - Persistencia de datos.
  - Integracion con Spigot.
- **Tecnologias destacadas**: Java, Spigot API.
- **Enlace publico**: SpigotMC.

### 5. DS3SaveBackup

- **Titulo**: DS3SaveBackup - Gestor de Backups de Partidas para Dark Souls 3
- **Estado**: publicado
- **Tags**: Python, utilidad, automatizacion, File I/O, Nexusmods
- **Resumen**: Utilidad en Python para hacer copias de seguridad de partidas de Dark Souls 3 y lanzarlas junto con el juego.
- **Reto**: DS3 no ofrece gestion nativa de backups de guardado, lo que expone al usuario a perdida de progreso.
- **Solucion**: Herramienta que solicita rutas de guardado, ejecutable y destino del backup; permite backup independiente o encadenado al lanzamiento del juego.
- **Funciones clave**:
  - Backup manual o automatizado.
  - Lanzamiento del juego junto al backup.
  - Interfaz en espanol e ingles.
  - Arquitectura ampliable por juego/perfil.
- **Tecnologias destacadas**: Python, automatizacion, lectura y escritura de archivos.
- **Enlace publico**: Nexusmods.

### 6. PromptTemplateLibrary

- **Titulo**: PromptTemplateLibrary - Gestor de plantillas YAML para LLMs
- **Estado**: en desarrollo
- **Tags**: YAML, PySide6, SQLite, LLMs, sincronizacion
- **Resumen**: Gestor de plantillas YAML para modelos de lenguaje con edicion, generacion y previsualizacion de prompts, mas indexacion de metadatos en SQLite.
- **Reto**: Centralizar prompts y plantillas reutilizables sin perder orden, trazabilidad ni consistencia entre archivos y metadatos.
- **Solucion**: Aplicacion de escritorio con PySide6 para editar, generar y previsualizar prompts a partir de YAML, con SQLite para indexar metadatos y sincronizacion de contenido.
- **Funciones clave**:
  - Edicion de plantillas YAML.
  - Generacion y previsualizacion de prompts.
  - Indexacion de metadatos en SQLite.
  - Sincronizacion entre archivos y base de datos.
- **Tecnologias destacadas**: YAML, PySide6, SQLite.

### 7. RepliTal Avatar

- **Titulo**: RepliTal Avatar
- **Estado**: finalizado
- **Tags**: Avatar IA, RepliTal, presentacion, video
- **Resumen**: Avatar virtual de presentacion para explicar RepliTal mediante un video narrado y preparado para presentacion web.
- **Reto**: Presentar RepliTal de forma clara, dinamica y cercana, manteniendo tono profesional y una explicacion breve.
- **Solucion**: Video con guion corto, pausado y bien separado por frases, pensado para sincronizar la locucion y mostrar una presentacion limpia del proyecto.
- **Funciones clave**:
  - Presentacion audiovisual de RepliTal.
  - Guion enfocado a claridad.
  - Integracion en la web del portfolio.
- **Tecnologias destacadas**: video, presentacion, avatar IA.

### 8. Fan Control

- **Titulo**: Hub de Control Climatico con ESP32, DHT11 y Transmision RF 433 MHz
- **Estado**: en expansion
- **Tags**: ESP32, Arduino, RF 433 MHz, DHT11, control climatico, GitHub publico
- **Resumen**: Hub de control climatico con ESP32, DHT11 y transmision RF 433 MHz para monitorizar temperatura y humedad y controlar un ventilador desde una interfaz web local.
- **Reto**: Control y monitorizacion en tiempo real sin infraestructura centralizada ni cableado adicional.
- **Solucion**: Nodo ESP32 con sensor DHT11 y emisor RF a 433 MHz, mas interfaz web embebida servida desde el microcontrolador.
- **Funciones clave**:
  - Monitorizacion de temperatura y humedad.
  - Control de ventilador RF.
  - Interfaz web local.
  - Base para evolucionar a PID o logica difusa.
- **Tecnologias destacadas**: ESP32, Arduino, HTML/CSS/JS, RF 433 MHz.
- **Enlace publico**: GitHub del proyecto.

### 9. Chatbot del portfolio

- **Titulo**: Chatbot del portfolio - Asistente contextual integrado con Chatbase
- **Estado**: integrado en la web
- **Tags**: Chatbase, JavaScript, integracion web, IA
- **Resumen**: Chatbot integrado en el portfolio como demostracion de uso de herramientas de terceros y como punto de partida para una futura version propia.
- **Reto**: Ofrecer una ayuda rapida y contextual sin construir todavia un backend propio.
- **Solucion**: Integracion del widget de Chatbase mediante JavaScript, aislado en un archivo propio y cargado solo en las paginas necesarias.
- **Funciones clave**:
  - Asistente contextual en la esquina inferior derecha.
  - Boton directo "Probar asistente" en la tarjeta del proyecto.
  - Integracion limpia en la web.
- **Tecnologias destacadas**: Chatbase, JavaScript, frontend web.

## Observaciones para RAG

- El portfolio mezcla proyectos de software, electronica, sistemas embebidos, IA y automatizacion.
- Hay dos grupos de proyectos:
  - **Proyectos principales**: los cinco que salen en la home.
  - **Otros proyectos**: trabajos auxiliares, demos e integraciones.
- Los proyectos suelen seguir la estructura: **Titulo, subtitulo, reto, solucion, estado actual, badges y enlace**.
- El portfolio prioriza una narrativa practica: problemas reales, solucion implementada y tecnologias concretas.
