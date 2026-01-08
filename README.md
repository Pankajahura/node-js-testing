# MongoDB Connectivity Test API

Minimal Express + Mongoose CRUD service meant solely for validating connectivity to a MongoDB cluster hosted on providers such as DigitalOcean.

## 1. Project Setup

1. Ensure Node.js (v18+) and npm are installed.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file (or duplicate `.env.example`) and fill in dummy or real credentials that map to your cluster.
4. Start the API:
   ```bash
   npm run dev   # watches with nodemon
   # or
   npm start     # plain node
   ```

## 2. Folder Structure & File Responsibilities

```
nodejs-app-test/
├─ .env / .env.example        # Environment variables (never commit real secrets)
├─ package.json               # Project metadata and npm scripts
├─ src/
│  ├─ server.js               # Entry point, loads env, connects DB, starts HTTP server
│  ├─ app.js                  # Express app configuration and middleware wiring
│  ├─ config/db.js            # Mongoose connection logic + logging
│  ├─ models/user.model.js    # User schema used for CRUD smoke tests
│  ├─ controllers/user.controller.js # Async handlers implementing CRUD
│  ├─ routes/user.routes.js   # Express router that exposes /api/users endpoints
│  └─ middleware/errorHandler.js    # 404 + centralized error handling middleware
└─ README.md                  # Documentation & usage guide
```

- **server.js**: Bootstraps the application, ensures `.env` is loaded, waits for MongoDB connectivity, then exposes the HTTP server.
- **app.js**: Applies JSON parsing, health check, registers domain routes, and plugs error middleware at the end.
- **config/db.js**: Contains the reusable async function that opens a MongoDB connection and logs success/failure.
- **models/user.model.js**: Defines a tiny User schema (name, email, timestamps) for CRUD smoke testing.
- **controllers**: Houses async controller functions, each wrapping DB calls in try/catch and delegating errors to middleware.
- **routes**: Keeps HTTP routes declarative and thin by mapping verbs to controller methods.
- **middleware**: Provides standardized 404 and error responses so every controller can simply `throw` or `next(err)`.

## 3. Environment Variables (.env)

All secrets stay in `.env`. Example values are intentionally dummy:

```
PORT=4000
MONGODB_URI=mongodb+srv://dummyUser:dummyPassword@dummy-host-001.mongodb.net/dummyDatabase?ssl=true
```

Replace `MONGODB_URI` with the URI supplied by DigitalOcean (user/pass/SSL flags, etc.).

## 4. Running & Observing Logs

- `npm run dev`: starts Nodemon; watch console for `MongoDB connected: ...` or connection errors.
- `npm start`: production-style start without file watching.
- Any connection failure immediately logs the reason and exits with a non-zero status code so container/orchestrator health checks can fail fast.

## 5. CRUD API Reference

Base URL: `http://localhost:4000`

| Method | Endpoint          | Description              |
| ------ | ----------------- | ------------------------ |
| POST   | `/api/users`      | Create a user document   |
| GET    | `/api/users`      | List all users           |
| GET    | `/api/users/:id`  | Fetch a user by Mongo ID |
| PUT    | `/api/users/:id`  | Update user fields       |
| DELETE | `/api/users/:id`  | Remove a user            |

### Sample Request Payload

```json
{
  "name": "Test User",
  "email": "user@example.com"
}
```

### Curl Examples

Create:
```bash
curl -X POST http://localhost:4000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"user@example.com"}'
```

Read All:
```bash
curl http://localhost:4000/api/users
```

Read By ID:
```bash
curl http://localhost:4000/api/users/<mongoId>
```

Update:
```bash
curl -X PUT http://localhost:4000/api/users/<mongoId> \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated","email":"updated@example.com"}'
```

Delete:
```bash
curl -X DELETE http://localhost:4000/api/users/<mongoId>
```

### Postman Tips

1. Import a new collection and create five requests that mirror the table above.
2. Set `{{baseUrl}}` environment variable to `http://localhost:4000` for convenience.
3. For POST/PUT, set Body → raw → JSON and use the sample payload.
4. Observe responses to confirm the DigitalOcean cluster is persisting data. Errors (e.g., invalid ObjectId, validation failures) return descriptive JSON messages.

## 6. Troubleshooting

- **Authentication failures**: Verify username/password and that the IP of the machine running this project is added to the MongoDB firewall/allowlist.
- **SSL requirements**: If the cluster enforces SSL/TLS, ensure the connection string includes `ssl=true` (already in the example URI).
- **ObjectId errors**: MongoDB requires 24-char hex IDs. Retry with IDs returned by the Create/List calls.

This project is intentionally minimal—extend controllers/models as needed once connectivity has been confirmed.
