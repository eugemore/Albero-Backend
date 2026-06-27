# 🌳 Albero — Backend API

GraphQL API for organizing documents required for Italian citizenship (*cittadinanza jure sanguinis*). Built with **NestJS**, **GraphQL (code-first)**, **Mongoose**, and **MongoDB**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS 10 |
| API | GraphQL (code-first) via `@nestjs/graphql` + Apollo Server |
| Database | MongoDB 7 via Mongoose + `@nestjs/mongoose` |
| Auth | JWT (RS256-compatible) + bcrypt |
| Email | Nodemailer (SMTP) |
| Runtime | Node.js 22 |
| Container | Docker + Docker Compose |

---

## Domain Model

```
User
 └── Family          (e.g. "Famiglia Morelli – Rosario")
      └── Person     (ancestor or family member)
           └── Document  (citizenship document with status)
```

### Document statuses

| Value | Meaning |
|---|---|
| `pendiente` | Not yet submitted or under review |
| `no_aceptado` | Rejected / requires correction |
| `aceptado` | Approved |

---

## Getting Started

### Prerequisites

- Node.js 22+
- Docker & Docker Compose (recommended) **or** a local MongoDB 7 instance

### 1 — Clone and configure

```bash
git clone https://github.com/eugemore/Albero-Backend.git
cd Albero-Backend
cp .env.example .env
# Edit .env with your values (JWT secret, SMTP credentials, etc.)
```

### 2a — Run with Docker (recommended)

```bash
docker compose up --build
```

The API will be available at `http://localhost:3000/graphql`.

### 2b — Run locally

```bash
npm install
npm run start:dev
```

Make sure MongoDB is running and `MONGODB_URI` in `.env` points to it.

---

## GraphQL Playground

When `NODE_ENV` is not `production`, the Apollo Sandbox is available at:

```
http://localhost:3000/graphql
```

### Example: Register and login

```graphql
# 1. Register
mutation {
  register(input: { email: "you@example.com", password: "MySecret123" })
}

# 2. After clicking the verification link in your email:
mutation {
  login(input: { email: "you@example.com", password: "MySecret123" }) {
    idToken
    expiresAt
  }
}
```

Add the token to the Authorization header for subsequent requests:

```
Authorization: Bearer <idToken>
```

### Example: Create a family and add a person

```graphql
mutation {
  createFamily(input: { name: "Famiglia Morelli – Rosario" }) {
    _id
    name
  }
}

mutation {
  createPerson(input: {
    firstName: "Giovanni"
    lastName: "Morelli"
    dateOfBirth: "1880-03-15"
    placeOfBirth: "Palermo, Italy"
    familyId: "<family_id>"
  }) {
    _id
    firstName
    lastName
  }
}
```

### Example: Add and update a document

```graphql
mutation {
  createDocument(input: {
    type: "Acta de nacimiento"
    personId: "<person_id>"
    issuingAuthority: "Comune di Palermo – Ufficio Anagrafe"
    issueDate: "1880-03-15"
  }) {
    _id
    type
    status
  }
}

# Update status after document is approved
mutation {
  updateDocument(input: {
    id: "<document_id>"
    status: aceptado
    notes: "Apostille obtained 2024-11-20"
  }) {
    _id
    status
    notes
  }
}
```

---

## Environment Variables

See `.env.example` for the full list. Required variables:

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `MAIL_HOST` | SMTP host |
| `MAIL_PORT` | SMTP port |
| `MAIL_USER` | SMTP username |
| `MAIL_PASS` | SMTP password |
| `WEB_URL` | Frontend URL (used in verification email) |

---

## Project Structure

```
src/
├── app.module.ts            # Root module
├── main.ts                  # Bootstrap
├── auth/                    # Registration, login, JWT, email verification
│   ├── dto/
│   ├── entities/
│   ├── responses/
│   ├── strategies/
│   ├── auth.module.ts
│   ├── auth.resolver.ts
│   └── auth.service.ts
├── families/                # Family CRUD
├── persons/                 # Person CRUD (with parent relationships)
├── documents/               # Document CRUD (with status management)
├── mailer/                  # Email sending via Nodemailer
└── common/
    ├── decorators/          # @CurrentUser()
    └── guards/              # GqlAuthGuard (JWT for GraphQL)
```

---

## License

MIT
