# Backend API Testing Guide

## Quick Start - Running the Backend

### 1. Setup Environment Variables
```bash
cd backend
cp .env.example .env
```

**Update `.env` with:**
```
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=brisbane_user
DB_PASSWORD=your_secure_password
DB_DATABASE=brisbane_realestate_leads

JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRATION=7d

NODE_ENV=development
API_PORT=3000
API_CORS_ORIGIN=http://localhost:4200
```

### 2. Start PostgreSQL Database
```bash
# Make sure PostgreSQL is running on localhost:5432
# Or update DB_HOST in .env to match your database location
```

### 3. Start Backend Server
```bash
cd backend
npm run start:dev
# Output should show:
# ✅ Server running on port 3000 (CORS enabled for http://localhost:4200)
```

---

## Testing Endpoints

### 1. Health Check (No Auth Required)
```bash
curl http://localhost:3000/api/leads/health
# Response: {"status":"OK"}
```

### 2. Register a User (No Auth Required)
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe",
    "role": "homeowner"
  }'

# Response:
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "role": "homeowner",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Login (No Auth Required)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Response:
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "role": "homeowner",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

# Save the accessToken for next requests
```

### 4. Get Current User (Auth Required)
```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 5. Create a Lead (Auth Required)
```bash
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "homeownerName": "Jane Smith",
    "homeownerEmail": "jane@example.com",
    "homeownerPhone": "+61412345678",
    "propertyAddress": "123 Main St, Brisbane 4000",
    "propertyType": "house",
    "preferredAgency": "Brisbane Central Realty",
    "preferredContactTime": "Evenings 5-8pm"
  }'
```

### 6. Get All Leads (Auth Required)
```bash
curl http://localhost:3000/api/leads \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# With filters:
curl "http://localhost:3000/api/leads?status=New&propertyType=house" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 7. Get Lead by ID (Auth Required)
```bash
curl http://localhost:3000/api/leads/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 8. Update Lead Status (Auth Required)
```bash
curl -X POST http://localhost:3000/api/leads/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "status": "Contacted",
    "notes": "Called homeowner, interested in appraisal",
    "nextFollowUpDate": "2026-01-20T10:00:00Z",
    "assignedAgentName": "John Agent"
  }'
```

### 9. Add Note to Lead (Auth Required)
```bash
curl -X POST http://localhost:3000/api/leads/1/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "note": "Homeowner is very interested in selling"
  }'
```

### 10. Get Call History (Auth Required)
```bash
curl http://localhost:3000/api/leads/1/call-history \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 11. Schedule Follow-up (Auth Required)
```bash
curl -X POST http://localhost:3000/api/leads/1/schedule-followup \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "followUpDate": "2026-01-22T14:00:00Z",
    "notes": "Follow up on property valuation"
  }'
```

---

## Common Issues & Solutions

### ❌ Error: "Cannot GET /leads"
**Solution**: Use the full path `/api/leads` not just `/leads`

### ❌ Error: "401 Unauthorized"
**Solution**: Include JWT token in Authorization header
```bash
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### ❌ Error: "Database connection failed"
**Solution**: 
1. Check PostgreSQL is running: `psql -U brisbane_user -d brisbane_realestate_leads`
2. Verify DB credentials in `.env` match your setup
3. Create database if needed: `createdb brisbane_realestate_leads`

### ❌ Error: "Port 3000 is already in use"
**Solution**: Change port in `.env`
```
API_PORT=3001
```

### ❌ Error: "Cannot read property 'getMany' of undefined"
**Solution**: Ensure all TypeORM entities are registered in `app.module.ts`

---

## Useful Commands

### Check if backend is running
```bash
curl http://localhost:3000/api/leads/health
```

### View backend logs
```bash
# In the terminal where npm run start:dev is running
# Ctrl+C to stop
```

### Reset database (development only)
```bash
# In TypeORM with synchronize: true, tables auto-create
# To reset: delete PostgreSQL database and recreate
psql -U brisbane_user -c "DROP DATABASE brisbane_realestate_leads;"
psql -U brisbane_user -c "CREATE DATABASE brisbane_realestate_leads;"
```

### Test with Postman/Insomnia
1. Get access token from `/api/auth/login`
2. Set Authorization header to `Bearer {token}`
3. Make requests to other endpoints

---

## API Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (invalid input) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Server Error |

---

## Database Schema (Auto-Created)

Tables created automatically on first run:
- `users` - User accounts with roles
- `leads` - Real estate leads
- `agencies` - Agency information
- `agents` - Real estate agents
- `territories` - Geographic territories
- `lead_assignments` - Lead-to-agent assignments

---

## User Roles

| Role | Permissions |
|------|-------------|
| `homeowner` | Create leads, view own leads |
| `agent` | View assigned leads, update status |
| `agency_admin` | Manage agents and territories |
| `system_admin` | Full system access |

---

## Frontend Integration

**Frontend should:**
1. Call `POST /api/auth/register` or `POST /api/auth/login`
2. Store `accessToken` in localStorage
3. Include `Authorization: Bearer {token}` in all requests
4. Handle 401 by redirecting to login page

Example Angular interceptor:
```typescript
// Add to all requests
request = request.clone({
  setHeaders: {
    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
  }
});
```
