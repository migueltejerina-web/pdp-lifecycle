# Prompt: Actualizar main e incorporar cambios locales en rama nueva

Ejecuta estos pasos en orden para crear una rama con los cambios locales, actualizar main con los últimos cambios del remoto, y subir la rama sin afectar main.

## Pasos

1. **Crear rama nueva con los cambios actuales**
   ```bash
   git checkout -b feature/checklist-validation
   ```

2. **Hacer commit de todos los cambios**
   ```bash
   git add .
   git commit -m "feat: validación por campo en checklist y secciones de propiedad"
   ```

3. **Volver a main y traer los últimos cambios del remoto**
   ```bash
   git checkout main
   git pull origin main
   ```

4. **Incorporar main en la rama de feature**
   ```bash
   git checkout feature/checklist-validation
   git merge main
   ```
   Si hay conflictos, resolverlos y hacer `git add` + `git commit` para completar el merge.

5. **Subir la rama al remoto**
   ```bash
   git push -u origin feature/checklist-validation
   ```

## Resultado esperado

- `main` local actualizado con los cambios del remoto
- Rama `feature/checklist-validation` con tus cambios + los de main
- Rama subida a `origin` lista para crear un Pull Request
