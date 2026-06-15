---
name: pm-onboarding
description: Interactive setup guide for PMs joining Vistral Lab. Installs and configures everything from scratch — Cursor, Git, SSH key, GitHub access, staging credentials, and first local run. Available in English and Spanish.
triggers:
  - "onboarding PM"
  - "setup inicial"
  - "configurar mi máquina"
  - "soy PM nuevo"
  - "PM onboarding"
  - "crear SSH key"
  - "configurar git"
  - "I'm a new PM"
  - "set up my machine"
  - "new PM setup"
  - "new product builder"
  - "nuevo product builder"
---

# PM Onboarding — Agent-Guided Setup

> **Language / Idioma:** This skill is bilingual. The agent detects the PM's language from their first message and responds accordingly. Spanish version below / Versión en español abajo.

---

## English Version

This skill guides a new PM (Product Builder) through the complete machine setup. The agent runs the necessary commands, verifies everything works, and stops if something fails before continuing.

### When to Use

- You're a new PM / Product Builder at Vistral Lab and need to set up your machine
- You've never used Git, SSH, or GitHub before
- Someone said "configure your SSH key and upload it to GitHub" and you don't know what that means
- You want to verify your setup is complete

### Steps Overview

The agent will walk you through these steps (in order):

1. **Welcome & diagnostic** — check what's already installed
2. **Create project folder** — `~/prophero/`
3. **Install Cursor** (if needed) — use your prophero account
4. **Create GitHub account** — `name-surname-prophero` naming convention
5. **Install Git** (if needed) — macOS: xcode-select / Windows: .exe from git-scm.com
6. **Configure Git identity** (name + email)
7. **Create SSH key** (for GitHub access)
8. **Upload SSH key to GitHub** (manual step, agent guides you)
9. **Request access** — GitHub repo + Supabase + Figma + 1Password in one Slack message
9.5. **Install Node.js** (if needed) — macOS: nvm / Windows: .msi from nodejs.org
10. **Clone the repo** + `npm install`
11. **Configure staging credentials** (`.env.local` from 1Password)
12. **Verify app runs** at localhost:3000
13. **Install Superpowers** (AI methodology plugin for Cursor + Claude Code)
14. **1Password** (non-blocking)
15. **Final verification**
15. **Next steps** — open project, read docs, start building

Each step includes verification. The agent won't continue if a step fails.

**For the full detailed procedure with commands, see the Spanish version below** (the commands are identical — only the explanations differ).

---

## Versión en Español

# PM Onboarding — Setup Guiado por el Agente

Este skill guía a un PM nuevo (Product Builder) a través del setup completo de su máquina.
El agente ejecuta los comandos necesarios, verifica que todo funcione,
y avisa si algo falló antes de continuar.

---

## Cuándo Usar Este Skill

- Sos PM / Product Builder nuevo en Vistral Lab y necesitás configurar tu máquina
- Nunca usaste Git, SSH, o GitHub antes
- Alguien te dijo "configurá tu SSH key y subila a GitHub" y no sabés qué es eso
- Querés verificar que tu setup está completo

---

## PROCESO DEL AGENTE

### PASO 0 — Bienvenida y diagnóstico inicial

El agente saluda y verifica qué ya está instalado:

```bash
echo "=== Diagnóstico de setup ===" && \
echo "Sistema operativo:" && uname -s && \
echo "Git:" && (git --version 2>/dev/null || echo "NO INSTALADO") && \
echo "Node:" && (node --version 2>/dev/null || echo "NO INSTALADO") && \
echo "SSH key existente:" && (ls ~/.ssh/id_ed25519.pub 2>/dev/null && echo "YA EXISTE" || echo "NO EXISTE") && \
echo "Carpeta prophero:" && (ls -d ~/prophero 2>/dev/null && echo "YA EXISTE" || echo "NO EXISTE") && \
echo "Cursor CLI:" && (cursor --version 2>/dev/null || echo "NO ENCONTRADO — probablemente instalado como app")
```

Mostrá el resultado al PM con lenguaje claro. Por ejemplo:
- "Git ya está instalado ✅ — saltamos ese paso"
- "No tenés SSH key todavía — la vamos a crear ahora"

---

### PASO 0.5 — Crear carpeta de proyectos Prophero

**Siempre hacer esto** antes de clonar cualquier repo:

```bash
mkdir -p ~/prophero
```

Explicar al PM:
> "Todos los repos de Prophero van a vivir dentro de `~/prophero/`. Así mantenés todo ordenado y sabés exactamente dónde está cada proyecto."

---

### PASO 1 — Instalar Cursor

**Si Cursor ya está abierto:** Este paso ya está hecho. Pasá al siguiente.

**Si no está instalado:**

```
1. Abrí tu navegador y andá a: https://cursor.com
2. Hacé click en "Download" para tu sistema operativo (Mac o Windows)
3. Instalá el archivo descargado como cualquier app
4. Abrí Cursor cuando termine
5. Usá tu cuenta de prophero para el login (@prophero.com)
```

El agente no puede instalar apps de escritorio, pero puede guiar paso a paso.

---

### PASO 2 — Crear cuenta de GitHub

**Verificar si ya tiene cuenta:**

Preguntarle al PM: "¿Ya tenés una cuenta de GitHub?"

**Si ya tiene una** → preguntá si es con el email de prophero. Si no, recomendá crear una nueva.

**Si NO tiene cuenta:**

Instrucciones para el PM:

```
1. Andá a: https://github.com/signup
2. Usá tu email de prophero: nombre@prophero.com
3. Para el username, usá el formato: nombre-apellido-prophero
   Ejemplo: ivan-velazco-prophero
4. Completá el registro

Avisame tu username cuando lo tengas creado.
```

Guardar el username del PM — se necesita para el paso de acceso al repo.

---

### PASO 3 — Instalar Git

**Detectar OS y Git:**
```bash
echo "OS: $(uname -s 2>/dev/null || echo Windows)" && (git --version 2>/dev/null || echo "Git: NO INSTALADO")
```

**Si ya está instalado:** Confirmá al PM y continuá.

**Si NO está instalado — macOS:**
```bash
xcode-select --install
```

> Decile al PM: "Va a aparecer una ventana de instalación. Hacé click en 'Instalar' y esperá que termine (~5 minutos). Avisame cuando termine."

Si eso no funciona, alternativa con Homebrew:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" && brew install git
```

**Si NO está instalado — Windows:**

```
1. Abrí tu navegador y andá a: https://git-scm.com/download/win
2. Descargá el instalador "64-bit Git for Windows Setup" .exe (la descarga empieza automáticamente)
3. Ejecutá el instalador
4. Dejá TODAS las opciones en sus valores por defecto — simplemente hacé click en Next en cada pantalla
5. Hacé click en Install y luego en Finish
6. Cerrá y volvé a abrir tu terminal (PowerShell o Command Prompt)
7. Avisame cuando termines
```

**Verificar en cualquier OS:**
```bash
git --version
```

Resultado esperado: `git version 2.x.x` → ✅

---

### PASO 4 — Configurar identidad Git

Pedí al PM su nombre completo y email de prophero antes de ejecutar.

```bash
git config --global user.name "NOMBRE_DEL_PM"
git config --global user.email "email@prophero.com"
git config --global init.defaultBranch main
```

Verificar:
```bash
git config --global user.name && git config --global user.email
```

Si muestra nombre y email correctos → ✅

---

### PASO 5 — Crear SSH Key

**Verificar si ya existe:**
```bash
ls ~/.ssh/id_ed25519.pub 2>/dev/null && echo "YA EXISTE" || echo "NO EXISTE"
```

**Si ya existe:** Mostrá la key existente y preguntá si quiere usarla o crear una nueva.

**Si NO existe (o quiere crear nueva):**

Pedí el email de prophero del PM, luego:

```bash
ssh-keygen -t ed25519 -C "EMAIL_PM" -f ~/.ssh/id_ed25519 -N ""
```

> El flag `-N ""` crea la key sin passphrase para no complicar el flujo del PM — no pedirle que cree una passphrase.

Agregar al SSH agent:
```bash
eval "$(ssh-agent -s)" && \
ssh-add ~/.ssh/id_ed25519
```

Verificar que se creó:
```bash
ls -la ~/.ssh/id_ed25519*
```

---

### PASO 6 — Subir SSH Key a GitHub

**Copiar la key pública:**
```bash
cat ~/.ssh/id_ed25519.pub
```

Mostrá el resultado al PM y dále estas instrucciones:

```
1. Seleccioná y copiá TODO el texto que aparece arriba
   (empieza con "ssh-ed25519" y termina con tu email)

2. Andá a: https://github.com/settings/ssh/new
   (tenés que estar logueado en GitHub)

3. En "Title": escribí "MacBook Vistral Lab" (o "Windows Vistral Lab")

4. En "Key": pegá el texto que copiaste

5. Hacé click en el botón verde "Add SSH key"

6. Si te pide contraseña de GitHub, ingresala

Avisame cuando lo hayas agregado.
```

**Verificar la conexión con GitHub:**
```bash
ssh -T git@github.com
```

Resultado esperado:
```
Hi <username>! You've successfully authenticated, but GitHub does not provide shell access.
```

Si aparece ese mensaje → ✅ SSH funcionando

Si falla con "Permission denied":
- Verificar que la key fue subida correctamente a GitHub
- Verificar que el ssh-agent está corriendo: `ssh-add -l`
- Re-agregar: `ssh-add ~/.ssh/id_ed25519`

---

### PASO 7 — Pedir acceso al repo y herramientas

El PM **no puede hacer esto solo** — necesita que el tech lead lo agregue.

Instrucciones para el PM:

```
📨 Mandá este mensaje en #vistral-lab (Slack):

"Hola! Soy [nombre], Product Builder nuevo.
Necesito acceso a:
- GitHub — repo pdp-lifecycle-units (GitHub user: [tu username])
- Supabase staging
- Figma
- 1Password"

Esperá la confirmación antes de continuar con el paso siguiente.
```

> Aclarar al PM: "Mientras esperás la confirmación podés tomarte un descanso — esto puede tardar unos minutos dependiendo de cuándo esté disponible el tech lead."

---

### PASO 7.5 — Instalar Node.js (si no está)

Node.js es necesario para instalar las dependencias del proyecto. Verificar antes de clonar:

```bash
node --version && npm --version
```

**Si ya está instalado:** Confirmá al PM y continuá.

**Si NO está instalado — macOS (recomendado: nvm):**

```bash
which brew || /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install nvm
mkdir -p ~/.nvm
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.zshrc
echo '[ -s "$(brew --prefix nvm)/nvm.sh" ] && source "$(brew --prefix nvm)/nvm.sh"' >> ~/.zshrc
source ~/.zshrc
nvm install --lts && nvm use --lts
```

**Si NO está instalado — Windows (instalador .msi):**

```
1. Abrí tu navegador y andá a: https://nodejs.org/en/download
2. En "Prebuilt Installer", elegí:
   - Version: LTS (recomendada)
   - OS: Windows
   - Architecture: x64
3. Descargá el archivo .msi
4. Ejecutá el instalador — dejá todas las opciones por defecto y hacé click en Next
5. IMPORTANTE: en la pantalla "Tools for Native Modules", dejá el checkbox SIN MARCAR
   (no lo necesitamos y dispara una instalación extra muy larga)
6. Hacé click en Install y luego en Finish
7. Cerrá y volvé a abrir tu terminal (PowerShell o Command Prompt)
8. Avisame cuando termines
```

**Verificar en cualquier OS:**
```bash
node --version && npm --version
```

Resultado esperado: `v20.x.x` y `10.x.x` o superior → ✅

---

### PASO 8 — Clonar el repositorio

**Una vez confirmado el acceso:**

```bash
cd ~/prophero && git clone git@github.com:PropHero-Tech/pdp-lifecycle-units.git
cd pdp-lifecycle-units
npm install
```

> `npm install` descarga las dependencias del proyecto. Puede tardar unos minutos.

Verificar que funciona:
```bash
ls ~/prophero/pdp-lifecycle-units/
```

Si el exit code es `0` y se ven los archivos del proyecto → ✅

---

### PASO 9 — Configurar credenciales de staging

Para que la app funcione en local, necesitás conectarla a la base de datos de staging.

**Verificar si ya está configurado:**
```bash
test -f ~/prophero/pdp-lifecycle-units/.env.local && \
grep -q "NEXT_PUBLIC_SUPABASE_URL=https" ~/prophero/pdp-lifecycle-units/.env.local && \
echo "YA CONFIGURADO" || echo "FALTA CONFIGURAR"
```

**Si NO está configurado:**

1. Ir a la carpeta del proyecto:
```bash
cd ~/prophero/pdp-lifecycle-units
```

2. Copiar el archivo de ejemplo:
```bash
cp .env.local.example .env.local
```

3. Decile al PM:

```
Ahora tenés que completar el archivo .env.local con las credenciales de staging.

Las credenciales están en 1Password, bajo "Vistral LAB AI Dashboard".

Abrí el archivo .env.local con cualquier editor de texto y completá estos 3 valores:

  NEXT_PUBLIC_SUPABASE_URL=https://TU_PROJECT_REF.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
  SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

⚠️  IMPORTANTE:
- Estas son SIEMPRE credenciales de staging. Nunca uses credenciales de producción en tu máquina.
- El archivo .env.local NUNCA se sube al repo — está en el .gitignore.

Avisame cuando lo hayas completado.
```

---

### PASO 10 — Verificar que la app levanta

```bash
cd ~/prophero/pdp-lifecycle-units && npm run dev
```

Decile al PM:

```
Abrí tu navegador y andá a: http://localhost:3000

Si ves la pantalla de login → ✅ Todo está configurado correctamente.
Si ves un error → Avisame qué dice y lo resolvemos.
```

Para detener el servidor: `Ctrl + C` en la Terminal.

---

### PASO 10.5 — Instalar Superpowers (plugin de metodología para el agente)

Superpowers le da a Cursor y Claude Code una metodología de trabajo estructurada — hace que el agente primero clarifique qué querés construir, arme un plan, y lo ejecute paso a paso. Una vez instalado, funciona automáticamente.

**En Cursor — ejecutar en el chat del agente:**

```
/add-plugin superpowers
```

O buscar "superpowers" en el marketplace de plugins de Cursor.

**En Claude Code — ejecutar en la terminal:**

```bash
/plugin install superpowers@claude-plugins-official
```

**Verificar que funciona** preguntando al agente en una sesión nueva:

```
Tell me about your superpowers
```

Si responde con una descripción de sus skills → ✅ instalado correctamente.

> Superpowers se instala por separado para cada herramienta (Cursor y Claude Code). Si el PM usa solo una, instalar solo ahí.

---

### PASO 11 — 1Password (no bloqueante, pero necesario)

Si el PM todavía no tiene acceso a 1Password:

```
📨 Mandá en #vistral-lab:
"Necesito acceso a 1Password para las credenciales del proyecto"

1Password es donde viven todas las contraseñas compartidas del equipo.
Nunca guardes credenciales en ningún otro lado.
```

---

### PASO 12 — Verificación final

Correr todos los checks juntos:

```bash
echo "=== VERIFICACIÓN FINAL ===" && \
echo "Git:" && git --version && \
echo "Node:" && node --version && \
echo "npm:" && npm --version && \
echo "SSH Key:" && ls ~/.ssh/id_ed25519.pub && \
echo "GitHub SSH:" && (ssh -T git@github.com 2>&1 | grep -q "successfully authenticated" && echo "✅ OK" || echo "⚠️ REVISAR") && \
echo "Repo clonado:" && (ls ~/prophero/pdp-lifecycle-units/package.json 2>/dev/null && echo "✅ OK" || echo "⚠️ FALTA") && \
echo ".env.local:" && (test -f ~/prophero/pdp-lifecycle-units/.env.local && echo "✅ OK" || echo "⚠️ FALTA") && \
echo "=== FIN ==="
```

---

### PASO 13 — Próximos pasos

Una vez que el setup está completo, decile al PM:

```
🎉 Setup completo! Estos son tus próximos pasos:

1. Abrí el proyecto en Cursor:
   File → Open Folder → elegí ~/prophero/pdp-lifecycle-units

2. Leé la guía del equipo en ClickUp para entender el workflow diario
   (cómo crear branches, PRs, y verificar en staging)

3. Cuando estés listo para hacer tu primer cambio, decime:
   "Quiero hacer [descripción del cambio]"
   y te guío paso a paso.

4. Si necesitás pedir acceso a Vercel o cualquier otra herramienta,
   mandá mensaje en #vistral-lab con qué necesitás.

📋 Recordatorio de herramientas:
- Cursor → donde hacés los cambios con ayuda del agente
- GitHub → donde vive el código y se revisan los cambios
- Vercel → donde se despliega la app (staging y producción)
- Supabase → la base de datos (siempre usamos staging en local)
- ClickUp → gestión de tareas y documentación
- Figma → diseños
- 1Password → credenciales compartidas
```

---

### PASO 14 — Cómo lanzar una app nueva (para PMs listos para construir)

Las nuevas apps viven **dentro del mismo proyecto de Supply** como rutas propias
(`/<slug>`). No hay que crear un proyecto de Vercel separado ni configurar Auth0.

**Flujo completo:**

1. Abrí el repo `pdp-lifecycle-units` en Cursor.
2. En el chat, escribí cualquiera de estas frases:
   `new app`, `spawn app`, `nueva app`, `crear app nueva`.
3. El agente te pregunta 5 cosas:
   - **slug** (kebab-case, ej. `investment`) → se convierte en la ruta `/<slug>`
   - **display name** (ej. `"Investment Tracker"`)
   - **owner** (handle de GitHub sin `@`, ej. `ivelazco`)
   - **color** de acento (`blue`, `emerald`, `amber`, `violet`, `rose`, `slate`)
   - **¿necesita sus propias tablas en Supabase?** (`yes` / `no`)
4. El skill crea `app/(apps)/<slug>/`, actualiza `.github/ownership.yml`,
   opcionalmente crea el schema de Supabase, y abre el PR.
5. Cuando el PR se fusiona a `dev`, la app ya está disponible en staging en `/<slug>`.

**Qué NO necesitás hacer:**

- Crear un proyecto nuevo en Vercel
- Configurar Auth0 (la sesión se hereda de Supply)
- Configurar env vars extra (las de Supabase son las mismas del proyecto)

---

## Notas para el Agente

- **Nunca asumas que algo está instalado** sin verificar primero con un comando
- **Mostrá el output de cada verificación** al PM en lenguaje simple
- **No continúes si un paso falla** — resolvé primero
- **Si el PM no entiende un término técnico**, explicalo en una oración antes de seguir
- **Para la SSH key**, el flag `-N ""` (sin passphrase) es intencional — no pedirle que cree una passphrase
- **El acceso al repo y herramientas de GitHub** no puede automatizarse — siempre requiere intervención humana del tech lead
- **GitHub username convention:** siempre `nombre-apellido-prophero` para cuentas nuevas
- **El repo correcto** para clonar es `git@github.com:PropHero-Tech/pdp-lifecycle-units.git`
- **Credenciales de staging** siempre vienen de 1Password, entrada "Vistral LAB AI Dashboard"
- **Nunca usar credenciales de producción** en la máquina local del PM
- **El MCP de Supabase** (si está configurado en Cursor) debe siempre apuntar al proyecto de staging, nunca al de producción. Si el PM pregunta sobre MCPs, verificar el project ID contra el de staging en 1Password

## Scope

Este skill cubre solo el setup técnico de la máquina.
Para el workflow diario (cómo crear PRs, verificar en staging, mergear a producción) → ver la guía del equipo en ClickUp o preguntar al agente en una nueva conversación.
