# Temporizador Secuencial

Aplicación móvil de productividad para Android desarrollada en **React Native** con **Expo**, que permite ejecutar secuencias temporizadas agrupadas en rutinas, con control de voz, sonidos y almacenamiento local en **SQLite**.
Diseñada para uso personal, sin backend ni cuentas.

## Características

- **CRUD** de grupos y secuencias.
- Ejecución secuencial con control de pausa, avance y retroceso.
- Ajuste rápido de tiempo (-10s / +10s).
- Configuración de voz y sonidos.
- Persistencia local con SQLite (sin conexión a internet).
- Exportación e importación de datos en JSON.
- Interfaz amigable y optimizada para uso vertical en Android.
- Soporte mínimo: Android 8.0 (API 26) en adelante.

## Requisitos

- **Node.js** ≥ 18 (recomendado v22.x)
- **npm** ≥ 9
- **VS Code** (opcional pero recomendado)
- **Expo Go** para pruebas en dispositivo físico

## Instalación

1. Clonar el repositorio:

   ```bash
   git clone https://github.com/usuario/temporizador-secuencial.git
   cd temporizador-secuencial
   ```

2. Instalar dependencias:

   ```bash
   npm install
   ```

3. Iniciar en modo desarrollo:

   ```bash
   npx expo start
   ```

4. Escanear el QR con **Expo Go** en tu Android para probar.

## Generar APK localmente

Usamos **EAS Build** para generar el APK:

1. Inicia sesión en EAS:

   ```bash
   npx eas-cli login
   ```

2. Configura el proyecto:

   ```bash
   npx eas-cli build:configure
   ```

3. Genera el APK:

   ```bash
   npx eas-cli build -p android --profile apk
   ```

4. Descarga el archivo desde el enlace que entrega EAS.

> **Nota:** No necesitas Android Studio para este proceso.

## Estructura del proyecto

```
src/
  app/                # Navegación y pantallas principales
  data/               # Repositorios y acceso a SQLite
  domain/             # Casos de uso y reglas de negocio
  runtime/            # Servicios en ejecución (ej. notificaciones)
  ui/                 # Componentes y estilos
```

## Base de datos

- **Motor:** SQLite (vía `expo-sqlite`)
- **Ubicación en Android:** `/data/data/<paquete_android>/databases/`
- **Ubicación en iOS:** `<App sandbox>/Library/SQLite/`
- Se respalda y restaura mediante exportación/importación en JSON desde la app.
