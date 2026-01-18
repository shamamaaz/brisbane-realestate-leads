# Copilot Instructions - Brisbane Real Estate Leads Platform

## Architecture Overview

**Stack**: NestJS backend + Angular frontend + PostgreSQL

This is a **lead generation and assignment system** where homeowners submit leads through a web form, and the system automatically assigns them to real estate agencies based on territory and property details.

### Key Services
- **Backend** (`backend/src/`): NestJS REST API running on port 3000
- **Frontend** (`frontend/src/app/`): Angular 10 SPA with Tailwind CSS
- **Database**: PostgreSQL with TypeORM (entities auto-sync via `synchronize: true`)

---

## Critical Architecture Patterns

### Lead Submission Flow
1. Frontend form validates via `CreateLeadDto` (Australian phone numbers, emails)
2. HTTP POST to `/api/leads` triggers `LeadsService.createLead()`
3. **Auto-assignment**: Lead automatically assigned via `LeadAssignmentsService` (agency matching by territory/postcode)
4. Response returns created Lead with relations (agency, territory)

See [SYSTEM_ARCHITECTURE.md](../SYSTEM_ARCHITECTURE.md#-data-flow-architecture) for full flow diagrams.

### Entity Relationships (TypeORM)
```
Lead (many) → Agency (one)
Lead (many) → Territory (one)
Agency (one) → Territory (many)
Agency (one) → Agent (many)
Agent ← LeadAssignment → Lead
```

**Critical**: When querying leads, use `.leftJoinAndSelect()` to load relations. Example in [leads.service.ts](../backend/src/leads/leads.service.ts#L43-L56).

### Module Organization
Each feature (leads, agencies, agents, territories) is a separate NestJS module with:
- `*.module.ts`: Imports TypeORM entities, exports services
- `*.service.ts`: Business logic, repository injection via `@InjectRepository()`
- `*.controller.ts`: HTTP endpoints
- `entities/`: TypeORM entity definitions

---

## Developer Workflows

### Backend Setup & Running
```bash
cd backend
npm install
npm run start:dev          # Watch mode with hot reload
npm run build && npm run start:prod
npm test                   # Run Jest tests
npm run lint               # ESLint with auto-fix
```

**Database**: Must be running PostgreSQL locally on `localhost:5432` with credentials in [app.module.ts](../backend/src/app.module.ts#L15-L22). Auto-creates tables via `synchronize: true`.

### Frontend Setup & Running
```bash
cd frontend
npm install
npm start                  # Uses cross-env for OpenSSL compatibility
npm run build              # Production build
ng test                    # Karma/Jasmine tests
ng lint                    # TSLint (may need deprecation handling)
```

**Environment files**: [environment.ts](../frontend/src/environments/environment.ts) (dev) and `environment.prod.ts` (prod) - backend API URL here.

### Key Commands for Common Tasks
- **Format code**: `npm run format` (backend) runs Prettier on `src/**/*.ts`
- **Add new module**: Use NestJS schematics (e.g., `nest generate module my-feature`)
- **Build DTOs**: Place in `backend/src/shared/dto/` with `class-validator` decorators

---

## Project-Specific Conventions

### Data Validation
- **Backend DTOs**: Use `class-validator` decorators (see [create-lead.dto.ts](../backend/src/shared/dto/create-lead.dto.ts))
  - Phone validation: `@IsPhoneNumber('AU')` for Australian format
  - Email: `@IsEmail()`
  - String fields: `@IsString()` or `@IsOptional()`
- **Frontend forms**: Reactive forms with validators (FormsModule, ReactiveFormsModule)

### Entity Timestamps
- Use `@CreateDateColumn()` and `@UpdateDateColumn()` auto-managed by TypeORM
- Never manually set `createdAt`/`updatedAt` in service logic

### Naming Conventions
- Components: `MyComponentComponent` (e.g., `LeadFormComponent`)
- Services: `my.service.ts` (e.g., `lead.service.ts`)
- DTOs: `my.dto.ts` in `shared/dto/` folder
- Entities: `my.entity.ts` in `entities/` subfolder
- Status fields: Use string literals (e.g., `'New' | 'Contacted' | 'Scheduled' | 'Closed'`)

### Error Handling
- Backend: Throw NestJS exceptions (`NotFoundException`, `BadRequestException`) - caught globally
- Frontend: Services return Observables with RxJS error handling
- Lead assignment failure is **non-blocking**: logged as warning but lead still created

---

## Cross-Component Communication

### Frontend Services
- [lead.service.ts](../frontend/src/app/services/lead.service.ts): POST/GET to `/api/leads`
- [agency.service.ts](../frontend/src/app/services/agency.service.ts): Agency data
- [agent.service.ts](../frontend/src/app/services/agent.service.ts): Agent data
- Services use `HttpClientModule` for HTTP calls

### Backend API Endpoints
- `POST /api/leads`: Create lead (calls auto-assignment after save)
- `GET /api/leads`: Get all leads (supports `?status=` and `?propertyType=` filters)
- `GET /api/leads/:id`: Get lead by ID with relations
- `PUT /api/leads/:id`: Update lead status/notes
- `DELETE /api/leads/:id`: Remove lead

### CORS
Enabled on backend in [main.ts](../backend/src/main.ts#L8) to allow frontend requests.

---

## Integration & Dependencies

### External Libraries
- **Backend**: `@nestjs/*`, `typeorm`, `pg` (PostgreSQL driver), `class-validator`
- **Frontend**: `@angular/*`, `rxjs`, `tailwindcss` (styling)
- **Styling**: Tailwind CSS with PostCSS (see [tailwind.config.js](../frontend/tailwind.config.js))

### Database Connection
PostgreSQL localhost with hardcoded credentials in `app.module.ts`. No environment variables configured—update before production.

### Seeding Data
Agency seed data in [agencies-seed.ts](../backend/src/shared/data/agencies-seed.ts) for testing (7 agencies with territories/postcodes).

---

## When Adding New Features

1. **Backend**: Create feature module → entity → DTO → service → controller
2. **Import module** in [app.module.ts](../backend/src/app.module.ts) and register TypeORM entity
3. **Frontend**: Create service → component(s) → add route in [app-routing.module.ts](../frontend/src/app/app-routing.module.ts)
4. **Add to declarations** in [app.module.ts](../frontend/src/app/app.module.ts)
5. **Test**: Write `.spec.ts` tests, run `npm test`

---

## Key Files Reference

| File | Purpose |
|------|---------|
| [app.module.ts](../backend/src/app.module.ts) | Backend module bootstrap, DB config, all imports |
| [leads.service.ts](../backend/src/leads/leads.service.ts) | Lead CRUD + auto-assignment logic |
| [lead.entity.ts](../backend/src/leads/entities/lead.entity.ts) | Lead database schema |
| [create-lead.dto.ts](../backend/src/shared/dto/create-lead.dto.ts) | Input validation for lead creation |
| [app.module.ts](../frontend/src/app/app.module.ts) | Frontend bootstrap, imports all components/services |
| [app-routing.module.ts](../frontend/src/app/app-routing.module.ts) | Frontend routes (home, agency-dashboard, property/:id) |
| [lead.service.ts](../frontend/src/app/services/lead.service.ts) | HTTP calls to backend Lead API |
