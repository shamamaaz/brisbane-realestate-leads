# 🧭 Professional Angular Routing Architecture

## Overview

This document describes the complete routing structure for the Brisbane Real Estate Leads platform. The app uses **lazy-loaded feature modules** with **role-based access guards** to ensure scalability and security.

---

## 📊 Routing Map

```
/                       → Landing Page (Public - Seller)
/sell                   → Seller Lead Form
/sell/thank-you         → Lead Submission Confirmation

/auth/login             → Login Page
/auth/register          → Registration Page

/agent                  → Agent Dashboard (Protected)
  ├─ /agent            → Agent Dashboard (default)
  └─ (expandable to more agent routes)

/agency                 → Agency Dashboard (Protected)
  ├─ /agency           → Agency Dashboard (default)
  └─ (expandable to more agency routes)

/admin                  → Admin Portal (Protected)
  ├─ /admin            → Admin Dashboard (default)
  └─ (expandable to more admin routes)

/**                     → 404 Page (redirects to home)
```

---

## 🔐 Authentication & Authorization

### Auth Guards

**Location:** `src/app/guards/`

#### AuthGuard (`auth.guard.ts`)
```typescript
canActivate(route, state): boolean {
  // Checks if user has valid token
  const token = localStorage.getItem('token');
  
  if (token) {
    return true;  // Allow access
  }
  
  // Redirect to login with return URL
  this.router.navigate(['/auth/login'], {
    queryParams: { returnUrl: state.url }
  });
  return false;
}
```

**Usage:** Applied to all protected routes (`/agent`, `/agency`, `/admin`)

#### RoleGuard (`role.guard.ts`)
```typescript
canActivate(route, state): boolean {
  // Checks if user's role matches route requirement
  const userRole = localStorage.getItem('role');
  const requiredRole = route.data['role'];
  
  if (userRole === requiredRole) {
    return true;  // Allow access
  }
  
  // Redirect to home if role doesn't match
  this.router.navigate(['/']);
  return false;
}
```

**Usage:** Applied with route data: `data: { role: 'agent' }`

### Storage Keys

The following localStorage keys are used:

| Key | Value | Example |
|-----|-------|---------|
| `token` | JWT/Bearer token | `eyJhbGc...` |
| `role` | User's role | `'agent'` or `'agency'` or `'admin'` |

---

## 🏗️ Module Structure

### Main App Module

**File:** `src/app/app.module.ts`

**Responsibilities:**
- Declare public components (Home, Login, Register, ThankYou)
- Import feature modules
- Configure HTTP interceptors
- Bootstrap the app

**Feature Modules Imported:**
- AgentModule
- AgencyModule
- AdminModule

---

### App Routing Module

**File:** `src/app/app-routing.module.ts`

**Route Configuration:**
```typescript
const routes: Routes = [
  // Public routes (no guards)
  { path: '', component: HomeComponent },
  { path: 'sell', component: HomeComponent },
  { path: 'sell/thank-you', component: ThankYouComponent },
  
  // Auth routes (no guards)
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  
  // Protected routes (AuthGuard + RoleGuard)
  {
    path: 'agent',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'agent' },
    loadChildren: () => import('./agent/agent.module').then(m => m.AgentModule)
  },
  
  {
    path: 'agency',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'agency' },
    loadChildren: () => import('./agency/agency.module').then(m => m.AgencyModule)
  },
  
  {
    path: 'admin',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin' },
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
  },
  
  // Catch-all (404)
  { path: '**', redirectTo: '' }
];
```

---

## 📦 Feature Modules

### Agent Module

**Location:** `src/app/agent/`

**Files:**
- `agent.module.ts` - Module definition
- `agent-routing.module.ts` - Route configuration

**Routes:**
```typescript
const routes: Routes = [
  { path: '', component: AgentDashboardComponent }
];
```

**Import:** AgentModule is lazy-loaded when `/agent` route is accessed

**Components Declared:**
- AgentDashboardComponent

---

### Agency Module

**Location:** `src/app/agency/`

**Files:**
- `agency.module.ts` - Module definition
- `agency-routing.module.ts` - Route configuration

**Routes:**
```typescript
const routes: Routes = [
  { path: '', component: AgencyDashboardComponent }
];
```

**Import:** AgencyModule is lazy-loaded when `/agency` route is accessed

**Components Declared:**
- AgencyDashboardComponent

---

### Admin Module

**Location:** `src/app/admin/`

**Files:**
- `admin.module.ts` - Module definition
- `admin-routing.module.ts` - Route configuration

**Routes:**
```typescript
const routes: Routes = [
  {
    path: '',
    redirectTo: '/',
    pathMatch: 'full'
  }
];
```

**Note:** Currently redirects to home. Can be expanded with admin components

---

## 👥 User Flows

### 🏠 Seller Flow (Public)

```
Home (/) 
  ↓
Sell Form (/sell) - Fill property details
  ↓
Submit Lead
  ↓
Thank You Page (/sell/thank-you) - Confirmation
  ↓
Back to Home (/)
```

### 🧑‍💼 Agent Flow (Protected)

```
Login (/auth/login)
  ↓
Agent Dashboard (/agent) - View assigned leads
  ↓
[Update Lead Status | Add Notes | Schedule Follow-up]
  ↓
Logout → Back to Home
```

### 🏢 Agency Flow (Protected)

```
Login (/auth/login)
  ↓
Agency Dashboard (/agency) - View agents and leads
  ↓
[Manage Agents | View All Leads]
  ↓
Logout → Back to Home
```

### 🛠️ Admin Flow (Protected)

```
Login (/auth/login)
  ↓
Admin Portal (/admin) - Manage platform
  ↓
[Manage Agencies | Manage Agents | View All Leads | Settings]
  ↓
Logout → Back to Home
```

---

## 🔄 Navigation Examples

### Programmatic Navigation

**Navigate to Agent Dashboard:**
```typescript
this.router.navigate(['/agent']);
```

**Navigate with Query Params:**
```typescript
this.router.navigate(['/auth/login'], {
  queryParams: { returnUrl: '/agent/leads/123' }
});
```

**Navigate to Thank You:**
```typescript
this.router.navigate(['/sell/thank-you']);
```

---

## 🛡️ Security Considerations

### Token Management

1. **Login:** Backend returns JWT token
   ```typescript
   // In LoginComponent
   this.authService.login(credentials).subscribe(response => {
     localStorage.setItem('token', response.token);
     localStorage.setItem('role', response.role);
     this.router.navigate([`/${response.role}`]);
   });
   ```

2. **Token Validation:** AuthGuard checks token existence
3. **Role Verification:** RoleGuard checks user role matches route requirement
4. **Logout:** Clear tokens and redirect to home
   ```typescript
   this.authService.logout().subscribe(() => {
     localStorage.removeItem('token');
     localStorage.removeItem('role');
     this.router.navigate(['/']);
   });
   ```

### Best Practices

✅ **DO:**
- Always use guards on protected routes
- Store tokens securely (localStorage or HttpOnly cookies)
- Clear tokens on logout
- Validate role before rendering sensitive components
- Use lazy-loading for feature modules

❌ **DON'T:**
- Store sensitive data in localStorage (use HttpOnly cookies instead for production)
- Bypass guards for testing (use mock Auth service instead)
- Hardcode role checks in components (use guards instead)
- Load all modules at startup (use lazy-loading)

---

## 📱 Responsive Routing

Routes work seamlessly across devices:

- **Desktop:** Full sidebar navigation + content
- **Tablet:** Collapsible sidebar + content
- **Mobile:** Bottom navigation tab bar + full-width content

---

## 🚀 Scaling the Routing

### Adding New Agent Routes

1. Add route to `agent-routing.module.ts`:
   ```typescript
   const routes: Routes = [
     { path: '', component: AgentDashboardComponent },
     { path: 'leads', component: AgentLeadsListComponent },
     { path: 'leads/:id', component: AgentLeadDetailComponent },
     { path: 'profile', component: AgentProfileComponent }
   ];
   ```

2. Create corresponding components

3. Update navigation in AgentDashboardComponent

### Adding New Admin Pages

1. Create feature module for admin
2. Add routes to `admin-routing.module.ts`
3. Create admin components
4. Link in admin dashboard

---

## 🧪 Testing Routes

### Unit Test Example

```typescript
describe('AgentDashboardComponent', () => {
  it('should navigate to agent dashboard', () => {
    spyOn(router, 'navigate');
    component.goToAgent();
    expect(router.navigate).toHaveBeenCalledWith(['/agent']);
  });
});
```

### E2E Test Example

```typescript
describe('Agent Flow', () => {
  it('should login and view agent dashboard', () => {
    cy.visit('/auth/login');
    cy.get('#email').type('agent@example.com');
    cy.get('#password').type('password123');
    cy.get('#submit').click();
    cy.url().should('include', '/agent');
  });
});
```

---

## 📋 Checklist for New Routes

When adding new routes, ensure:

- ✅ Route defined in appropriate routing module
- ✅ Component created and declared
- ✅ Guards applied if protected
- ✅ Navigation links added to menu/sidebar
- ✅ Breadcrumbs updated
- ✅ Tests written
- ✅ Mobile responsive verified
- ✅ Logout/auth error handling added

---

## 🎯 Summary

This routing architecture provides:

✨ **Professional Structure:** Lazy-loaded modules, role-based access  
🔒 **Security:** Multiple guard layers, token management  
📱 **Scalability:** Easy to add new routes and modules  
🧪 **Testability:** Guards injectable, routes mockable  
⚡ **Performance:** Lazy loading for faster app startup  

All routes are protected with guards and follow best practices for Angular 10+.
