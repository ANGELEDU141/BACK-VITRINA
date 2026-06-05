# Documentacion API IPEYS Backend

## 1. Resumen General

Este backend usa arquitectura MVC ampliada con capa de servicios:

```txt
routes -> controllers -> services -> models -> config/database
```

La base de datos es MySQL Server. Al ejecutar `npm start`, el backend:

```txt
1. Conecta a MySQL.
2. Crea la base de datos si no existe.
3. Crea las tablas si no existen.
4. Inserta usuarios y categorias iniciales sin duplicar.
5. Levanta el servidor en http://localhost:3000.
```

## 2. Variables De Entorno

Valores por defecto:

```txt
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=ipeys_db

ADMIN_USER=admin
ADMIN_PASSWORD=admin123

NORMAL_USER=user
USER_PASSWORD=user123

JWT_SECRET=ipeys-dev-secret
```

Para hosting, configurar como minimo:

```txt
DB_HOST=host-del-mysql
DB_PORT=3306
DB_USER=usuario-mysql
DB_PASSWORD=password-mysql
DB_NAME=nombre-db
JWT_SECRET=clave-secreta-fuerte
```

## 3. Roles Y Seguridad

Roles disponibles:

```txt
admin
user
```

Reglas:

```txt
admin:
- Puede iniciar sesion.
- Recibe JWT.
- Puede acceder al panel administrador.
- Puede crear, editar y eliminar usuarios, categorias y perfiles.

user:
- No inicia sesion.
- No recibe JWT.
- No accede al panel administrador.
- Representa usuario normal o visitante dentro del sistema.
```

El visitante no necesita login para ver la grilla ni el detalle de perfiles.

Para rutas protegidas se usa:

```txt
Authorization: Bearer <TOKEN_ADMIN>
```

## 4. Rutas Publicas

Estas rutas no requieren token:

```txt
GET /api/health
GET /api/categorias
GET /api/perfiles
GET /api/perfiles/:id
```

### 4.1 Health

```http
GET /api/health
```

Verifica que el backend este activo.

Respuesta:

```json
{
  "status": "ok"
}
```

### 4.2 Listar Categorias

```http
GET /api/categorias
```

Lista categorias disponibles para la grilla publica.

Respuesta:

```json
[
  {
    "id": 1,
    "nombre": "Abogados"
  },
  {
    "id": 2,
    "nombre": "Contadores"
  }
]
```

### 4.3 Listar Perfiles Para Grilla

```http
GET /api/perfiles
```

Lista perfiles publicos para renderizar tarjetas en la grilla.

Busca en:

```txt
nombre del perfil, empresa o profesional
descripcion
nombre de categoria
```

Query params opcionales:

```txt
search
categoria_id
```

Ejemplos:

```http
GET /api/perfiles
GET /api/perfiles?search=abogado
GET /api/perfiles?search=estudio
GET /api/perfiles?search=Arquitectos
GET /api/perfiles?categoria_id=1
GET /api/perfiles?search=perez&categoria_id=1
```

Respuesta:

```json
[
  {
    "id": 1,
    "nombre": "Estudio Legal Perez",
    "descripcion": "Abogados especialistas en derecho comercial",
    "logo_base64": "base64-logo",
    "categoria_id": 1,
    "categoria_nombre": "Abogados",
    "created_at": "2026-06-05T00:00:00.000Z"
  }
]
```

Nota: esta ruta devuelve datos ligeros para la grilla. No devuelve la galeria completa.

### 4.4 Detalle De Perfil

```http
GET /api/perfiles/:id
```

Obtiene el detalle completo de un perfil para abrir el modal.

Respuesta:

```json
{
  "id": 1,
  "nombre": "Estudio Legal Perez",
  "descripcion": "Abogados especialistas en derecho comercial",
  "logo_base64": "base64-logo",
  "categoria_id": 1,
  "categoria_nombre": "Abogados",
  "creado_por": 1,
  "created_at": "2026-06-05T00:00:00.000Z",
  "galeria": [
    {
      "id": 1,
      "imagen_base64": "base64-imagen-1"
    },
    {
      "id": 2,
      "imagen_base64": "base64-imagen-2"
    }
  ]
}
```

## 5. Autenticacion Admin

### 5.1 Login

```http
POST /api/auth/login
```

Inicia sesion solo para administradores.

Body:

```json
{
  "usuario": "admin",
  "password": "admin123"
}
```

Respuesta correcta:

```json
{
  "token": "jwt_generado",
  "user": {
    "id": 1,
    "usuario": "admin",
    "role": "admin"
  }
}
```

Si intenta entrar un usuario normal:

```json
{
  "message": "Solo administradores pueden iniciar sesion"
}
```

Si las credenciales son incorrectas:

```json
{
  "message": "Credenciales invalidas"
}
```

## 6. Rutas Protegidas Admin

Todas las rutas de esta seccion requieren:

```txt
Authorization: Bearer <TOKEN_ADMIN>
```

## 7. Usuarios

### 7.1 Listar Usuarios

```http
GET /api/users
```

Lista usuarios registrados.

Respuesta:

```json
[
  {
    "id": 1,
    "usuario": "admin",
    "role": "admin"
  },
  {
    "id": 2,
    "usuario": "user",
    "role": "user"
  }
]
```

### 7.2 Crear Usuario

```http
POST /api/users
```

Crea un usuario con rol `admin` o `user`.

Body:

```json
{
  "usuario": "nuevo_usuario",
  "password": "123456",
  "role": "user"
}
```

Respuesta:

```json
{
  "id": 3,
  "usuario": "nuevo_usuario",
  "role": "user"
}
```

Nota: el backend usa el menor ID numerico disponible para mantener orden.

### 7.3 Editar Usuario

```http
PUT /api/users/:id
PATCH /api/users/:id
```

Edita usuario, password o rol.

Body:

```json
{
  "usuario": "usuario_editado",
  "password": "nueva_clave",
  "role": "admin"
}
```

Respuesta:

```json
{
  "id": 3,
  "usuario": "usuario_editado",
  "role": "admin"
}
```

### 7.4 Eliminar Usuario

```http
DELETE /api/users/:id
```

Elimina un usuario.

Respuesta:

```json
{
  "message": "Usuario eliminado correctamente"
}
```

Restricciones:

```txt
- El admin no puede eliminar su propio usuario.
- Si el usuario tiene perfiles asociados, puede responder conflicto.
```

## 8. Categorias

### 8.1 Crear Categoria

```http
POST /api/categorias
```

Body:

```json
{
  "nombre": "Medicos"
}
```

Respuesta:

```json
{
  "id": 5,
  "nombre": "Medicos"
}
```

### 8.2 Editar Categoria

```http
PUT /api/categorias/:id
```

Body:

```json
{
  "nombre": "Medicina"
}
```

Respuesta:

```json
{
  "id": 5,
  "nombre": "Medicina"
}
```

### 8.3 Eliminar Categoria

```http
DELETE /api/categorias/:id
```

Respuesta:

```json
{
  "message": "Categoria eliminada correctamente"
}
```

Restriccion: si la categoria tiene perfiles asociados, responde conflicto.

## 9. Perfiles

### 9.1 Crear Perfil

```http
POST /api/perfiles
```

Body:

```json
{
  "nombre": "Estudio Legal Perez",
  "descripcion": "Abogados especialistas en derecho comercial",
  "logo_base64": "base64-logo",
  "categoria_id": 1,
  "galeria": [
    "base64-imagen-1",
    "base64-imagen-2"
  ]
}
```

Respuesta:

```json
{
  "id": 1,
  "nombre": "Estudio Legal Perez",
  "descripcion": "Abogados especialistas en derecho comercial",
  "logo_base64": "base64-logo",
  "categoria_id": 1,
  "categoria_nombre": "Abogados",
  "creado_por": 1,
  "created_at": "2026-06-05T00:00:00.000Z",
  "galeria": [
    {
      "id": 1,
      "imagen_base64": "base64-imagen-1"
    }
  ]
}
```

Nota: `creado_por` se obtiene automaticamente desde el JWT admin.

### 9.2 Editar Perfil

```http
PUT /api/perfiles/:id
PATCH /api/perfiles/:id
```

Body:

```json
{
  "nombre": "Nuevo nombre",
  "descripcion": "Nueva descripcion",
  "logo_base64": "nuevo-base64-logo",
  "categoria_id": 2,
  "galeria": [
    "base64-nueva-imagen-1",
    "base64-nueva-imagen-2"
  ]
}
```

Respuesta:

```json
{
  "id": 1,
  "nombre": "Nuevo nombre",
  "descripcion": "Nueva descripcion",
  "logo_base64": "nuevo-base64-logo",
  "categoria_id": 2,
  "categoria_nombre": "Contadores",
  "creado_por": 1,
  "created_at": "2026-06-05T00:00:00.000Z",
  "galeria": [
    {
      "id": 3,
      "imagen_base64": "base64-nueva-imagen-1"
    }
  ]
}
```

Nota: si se envia `galeria`, reemplaza la galeria anterior.

### 9.3 Eliminar Perfil

```http
DELETE /api/perfiles/:id
```

Respuesta:

```json
{
  "message": "Perfil eliminado correctamente"
}
```

Nota: las imagenes de `galeria_modales` se eliminan automaticamente por `ON DELETE CASCADE`.

## 10. Flujo Publico

```txt
1. Visitante entra a la web.
2. React llama GET /api/perfiles.
3. React renderiza la grilla.
4. Visitante busca por nombre, empresa, profesional o categoria.
5. React llama GET /api/perfiles?search=texto.
6. Visitante hace clic en una tarjeta.
7. React llama GET /api/perfiles/:id.
8. React abre el modal con la galeria.
```

## 11. Flujo Admin

```txt
1. Admin hace POST /api/auth/login.
2. Backend devuelve JWT.
3. React guarda el JWT.
4. React envia Authorization: Bearer <TOKEN_ADMIN>.
5. Backend valida token y role admin.
6. Admin gestiona usuarios, categorias y perfiles.
```

## 12. Errores Comunes

Sin token en ruta protegida:

```json
{
  "message": "Token requerido"
}
```

Token invalido:

```json
{
  "message": "Token invalido"
}
```

Token expirado:

```json
{
  "message": "Token expirado"
}
```

Usuario normal intentando login:

```json
{
  "message": "Solo administradores pueden iniciar sesion"
}
```

Usuario duplicado:

```json
{
  "message": "El usuario ya existe"
}
```

Categoria duplicada:

```json
{
  "message": "La categoria ya existe"
}
```

Perfil no encontrado:

```json
{
  "message": "Perfil no encontrado"
}
```

## 13. Tablas MySQL

```txt
users
- id
- usuario
- password
- role

categorias
- id
- nombre

perfiles_grilla
- id
- nombre
- descripcion
- logo_base64
- categoria_id
- creado_por
- created_at

galeria_modales
- id
- perfil_id
- imagen_base64
```

Relaciones:

```txt
users.id -> perfiles_grilla.creado_por
categorias.id -> perfiles_grilla.categoria_id
perfiles_grilla.id -> galeria_modales.perfil_id
```

## 14. Ejemplo Completo

### Login admin

```http
POST /api/auth/login
```

```json
{
  "usuario": "admin",
  "password": "admin123"
}
```

### Crear categoria

```http
POST /api/categorias
Authorization: Bearer <TOKEN_ADMIN>
```

```json
{
  "nombre": "Diseñadores"
}
```

### Crear perfil

```http
POST /api/perfiles
Authorization: Bearer <TOKEN_ADMIN>
```

```json
{
  "nombre": "Studio Creativo Lopez",
  "descripcion": "Diseño grafico, branding y contenido comercial",
  "logo_base64": "base64-logo",
  "categoria_id": 5,
  "galeria": [
    "base64-foto-1",
    "base64-foto-2"
  ]
}
```

### Buscar publicamente

```http
GET /api/perfiles?search=lopez
```

### Abrir modal

```http
GET /api/perfiles/1
```
