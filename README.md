# Bear Spark Server

Backend API Server for Bear Spark project.

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Koa 2.x
- **Language**: TypeScript 5.x (Strict Mode)
- **ORM**: TypeORM
- **Validation**: Zod, Joi
- **Logging**: Winston
- **Testing**: Vitest
- **Linting**: ESLint + Prettier

## Project Structure

```
bear-spark-server/
├── src/
│   ├── config/          # Configuration and environment
│   ├── controller/      # Request handlers
│   ├── database/        # Database connection & migrations
│   ├── middleware/      # Koa middleware
│   ├── router/          # Route registration
│   ├── service/         # Business logic
│   ├── types/           # TypeScript interfaces
│   ├── utils/           # Utility functions
│   └── index.ts         # Application entry point
├── logs/                # Log files
├── dist/                # Compiled output
└── package.json
```

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your settings
```

### 3. Run Development Server

```bash
npm run dev
```

### 4. Build for Production

```bash
npm run build
npm start
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm run lint` | Lint and fix code style issues |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run test` | Run unit tests |
| `npm run prettier` | Format code with Prettier |

## Code Standards

- **Strict TypeScript**: Full type safety enabled
- **ESLint**: Enforces code quality and catches errors
- **Prettier**: Consistent code formatting
- **Vitest**: Unit tests required for utilities and services

## API Design Principles

1. RESTful endpoint naming
2. Consistent response format
3. Proper HTTP status codes
4. Input validation on all endpoints
5. Error handling with meaningful messages
