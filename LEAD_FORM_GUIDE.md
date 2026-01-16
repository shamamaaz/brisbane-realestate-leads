# Lead Submission Form - Implementation Guide

## Overview
The Lead Submission Form is now fully integrated with the Brisbane Real Estate Leads application. Homeowners can submit property leads through the Angular frontend, which are processed and stored in the NestJS backend database.

---

## 📋 Data Model

### Lead Entity (Backend)
```typescript
Lead {
  id: number;                    // auto-generated
  homeownerName: string;
  homeownerEmail: string;
  homeownerPhone: string;
  propertyAddress: string;
  propertyType?: string;         // house, apartment, unit, etc.
  preferredAgency?: string;
  preferredContactTime?: string; // e.g., "Evenings 5-8pm"
  status: string;                // Default: "New" (New, Contacted, Scheduled, Closed)
  estimatedValue?: number;
  territory?: Territory;         // optional foreign key
  agency?: Agency;               // optional foreign key
  createdAt: Date;               // auto-generated
  updatedAt: Date;               // auto-updated
}
```

### Lead DTO (Data Transfer Object)
Used for validating incoming requests with decorators:
- `homeownerName` - Required string
- `homeownerEmail` - Required valid email
- `homeownerPhone` - Required AU phone number
- `propertyAddress` - Required string
- `propertyType` - Optional string
- `preferredAgency` - Optional string
- `preferredContactTime` - Optional string
- `territoryId` - Optional number
- `agencyId` - Optional number

---

## 🎨 Frontend Implementation

### Lead Form Component
**Location:** `frontend/src/app/components/lead-form/`

#### lead-form.component.ts
- **Form Control**: Uses Reactive Forms with FormBuilder
- **Validation**: Required field validation and email format checking
- **Features**:
  - Real-time validation feedback
  - Loading state during submission
  - Success/error messages
  - Auto-clear form after successful submission
  - Event emission to parent component

#### lead-form.component.html
- Clean, user-friendly form with Tailwind CSS styling
- 7 input fields:
  1. **Homeowner Name** (required)
  2. **Email Address** (required)
  3. **Phone Number** (required)
  4. **Property Address** (required)
  5. **Property Type** (required - dropdown)
  6. **Preferred Agency** (optional)
  7. **Best Call Time** (optional)
- Responsive design with focus states
- Submit button with loading indicator

#### lead-form.component.scss
- Smooth transitions and hover effects
- Focus state enhancements
- Disabled state styling

### Home Component Integration
**Location:** `frontend/src/app/pages/home/`

- Lead form prominently displayed at the top of the home page
- Gradient background highlighting the form section
- Seamless integration with existing search and property display
- Lead submission event handler passes data to service

### Lead Service
**Location:** `frontend/src/app/services/lead.service.ts`

```typescript
createLead(lead: Lead): Observable<Lead>
getLeads(): Observable<Lead[]>
getLeadById(id: number): Observable<Lead>
updateLead(id: number, lead: Lead): Observable<Lead>
deleteLead(id: number): Observable<void>
```

### Lead Model
**Location:** `frontend/src/app/models/lead.model.ts`

```typescript
export interface Lead {
  id?: number;
  homeownerName: string;
  homeownerEmail: string;
  homeownerPhone: string;
  propertyAddress: string;
  propertyType?: string;
  preferredAgency?: string;
  preferredContactTime?: string;
  status?: string;
  territoryId?: number;
  agencyId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
```

---

## 🔧 Backend Implementation

### Lead Controller
**Location:** `backend/src/leads/leads.controller.ts`

**Endpoints:**
- `POST /leads` - Create a new lead
- `GET /leads` - Get all leads
- `GET /leads/:id` - Get lead by ID
- `PUT /leads/:id` - Update lead
- `DELETE /leads/:id` - Delete lead

### Lead Service
**Location:** `backend/src/leads/leads.service.ts`

**Methods:**
- `createLead(createLeadDto)` - Creates lead with validation, auto-assigns to agents
- `getAllLeads()` - Returns all leads with relations, sorted by newest first
- `getLeadById(id)` - Gets specific lead with relations
- `updateLead(id, updateLeadDto)` - Updates lead and timestamp
- `deleteLead(id)` - Removes lead from database

**Features:**
- Automatic lead assignment to agents/agencies
- Error handling with NestJS exceptions
- Relationship loading with TypeORM

### Lead Entity
**Location:** `backend/src/leads/entities/lead.entity.ts`

- TypeORM entity with decorators
- Relations to Agency and Territory entities
- Automatic timestamp management (createAt, updatedAt)

### Create Lead DTO
**Location:** `backend/src/shared/dto/create-lead.dto.ts`

- Uses `class-validator` decorators for input validation
- Validates phone number format for Australian numbers
- Email format validation
- String type validation

---

## 🌐 API Integration

### Base URL Configuration
**Development:** `http://localhost:3000`
**Production:** `https://api.brisbane-realestate-leads.com`

Set in: `frontend/src/environments/environment.ts`

### Request/Response Example

**Request:**
```json
POST /api/leads
{
  "homeownerName": "John Smith",
  "homeownerEmail": "john@example.com",
  "homeownerPhone": "+61412345678",
  "propertyAddress": "123 Queen Street, Brisbane QLD 4000",
  "propertyType": "apartment",
  "preferredAgency": "ABC Real Estate",
  "preferredContactTime": "Evenings 5-8pm"
}
```

**Response:**
```json
{
  "id": 1,
  "homeownerName": "John Smith",
  "homeownerEmail": "john@example.com",
  "homeownerPhone": "+61412345678",
  "propertyAddress": "123 Queen Street, Brisbane QLD 4000",
  "propertyType": "apartment",
  "preferredAgency": "ABC Real Estate",
  "preferredContactTime": "Evenings 5-8pm",
  "status": "New",
  "createdAt": "2026-01-16T10:30:00.000Z",
  "updatedAt": "2026-01-16T10:30:00.000Z",
  "territory": null,
  "agency": null,
  "estimatedValue": null
}
```

---

## ✅ Form Validation

### Frontend Validation
- **Required Fields**: All major fields (name, email, phone, address, property type)
- **Email Format**: Valid email address required
- **Phone Number**: Must be valid format
- **Real-time Feedback**: Validation messages appear on blur/submit

### Backend Validation (DTO)
- **Class-validator Decorators**: Applied to CreateLeadDto
- **Australian Phone Format**: `@IsPhoneNumber('AU')`
- **Email Format**: `@IsEmail()`
- **String Validation**: `@IsString()`

### Error Handling
- **Frontend**: Displays user-friendly error messages
- **Backend**: Returns proper HTTP status codes with error details

---

## 🚀 Workflow

### Step-by-Step Flow

1. **Homeowner visits home page**
   - Lead form prominently displayed at top

2. **Fills out form with property details**
   - Real-time validation feedback
   - All required fields must be completed

3. **Submits form**
   - Frontend validates data
   - Shows "Submitting..." state

4. **API Request sent**
   - `POST /api/leads` with lead data
   - Backend receives and validates

5. **Backend processing**
   - Creates Lead entity in database
   - Auto-assigns lead to agencies/agents
   - Logs submission

6. **Success response**
   - Returns created lead with ID
   - Frontend displays success message
   - Form clears automatically

7. **Agencies can view leads**
   - Through `/api/leads` endpoint
   - Leads sorted by newest first
   - Can update status as they progress

---

## 📊 Status Lifecycle

Leads follow this status progression:

```
New → Contacted → Scheduled → Closed
```

- **New**: Initial status when lead is submitted
- **Contacted**: Agency has made initial contact
- **Scheduled**: Appointment scheduled with homeowner
- **Closed**: Lead completed (sold, not interested, etc.)

Status can be updated via PUT endpoint:
```
PUT /api/leads/:id
{
  "status": "Contacted"
}
```

---

## 🔍 Future Enhancements

1. **Agency Portal**
   - Dashboard displaying all leads
   - Filter by status, territory, date
   - Status update interface
   - Lead notes and communication history

2. **Lead Assignment Logic**
   - Territory-based assignment
   - Workload balancing
   - Agency preference matching
   - Automatic notifications to agents

3. **Advanced Features**
   - Lead scoring algorithm
   - Email notifications to agencies
   - SMS confirmations to homeowners
   - Property value estimation integration
   - Bulk lead upload
   - Lead search and analytics

---

## 🛠️ Development Setup

### Frontend Dependencies
```json
{
  "@angular/common": "latest",
  "@angular/forms": "latest",
  "@angular/platform-browser": "latest",
  "tailwindcss": "latest"
}
```

### Backend Dependencies
```json
{
  "@nestjs/common": "latest",
  "@nestjs/core": "latest",
  "@nestjs/typeorm": "latest",
  "typeorm": "latest",
  "class-validator": "latest"
}
```

### Running Locally

**Frontend:**
```bash
cd frontend
npm install
ng serve
# Access at http://localhost:4200
```

**Backend:**
```bash
cd backend
npm install
npm run start:dev
# API at http://localhost:3000
```

---

## ✨ Key Features Implemented

✅ Lead form with 7 fields (5 required, 2 optional)
✅ Reactive form validation on frontend
✅ Backend DTO validation with class-validator
✅ Automatic timestamp management
✅ Lead status tracking (default: "New")
✅ Agency and Territory relationships
✅ Auto-assignment to agencies
✅ Full CRUD operations on leads
✅ Error handling and user feedback
✅ Responsive design with Tailwind CSS
✅ Real-time validation feedback
✅ Success/error message display
✅ Loading state during submission

---

## 📝 Notes

- Phone validation uses Australian format (`+61x` or `04x`)
- All lead data is persisted to the database
- Leads are automatically ordered by newest first
- Form clears after successful submission
- Comprehensive error messages for debugging
- CORS enabled for frontend-backend communication

---

**Implementation Complete!** ✨

The Lead Submission Form is now fully functional and integrated with the Brisbane Real Estate Leads application. Homeowners can submit their property leads, and agencies can manage them through the backend API.

Next steps: Build the **Agency Portal** with lead management dashboard!
