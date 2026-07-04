# Albero Backend

## Stack
- NestJS + TypeScript
- MongoDB Atlas (Mongoose)
- JWT para autenticación
- Nodemailer (SMTP via Mailtrap en dev)
- Docker (imagen para deploy)

## Deploy
- **Plataforma**: Render (Web Service, Docker)
- **URL**: tu-backend.onrender.com
- **Base de datos**: MongoDB Atlas, cluster `albero-cluster`, base `albero`

## Variables de entorno (ver .env.example)
- `MONGODB_URI`: connection string de Atlas
- `JWT_SECRET`: secreto para tokens JWT
- `MAIL_*`: configuración SMTP
- `WEB_URL`: URL del frontend en Vercel
- `PORT`: 3000
- `NODE_ENV`: production en Render

## Estado actual
- Deploy funcionando en Render
- Autenticación completa (registro, verificación por email, login)
- Conectado a MongoDB Atlas

## Repos relacionados
- Frontend: github.com/eugemore/albero-web-v19