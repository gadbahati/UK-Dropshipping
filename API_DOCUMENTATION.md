# Globalpack Dropshipping Platform - API Documentation

## Overview

The Globalpack Dropshipping Platform is a full-stack web application built with tRPC, React, Express, and MySQL. It provides a complete workflow for managing dropshipping operations with strict admin approval at every stage.

## Architecture

- **Frontend**: React 19 with Tailwind CSS 4 and shadcn/ui components
- **Backend**: Express 4 with tRPC 11 for type-safe API
- **Database**: MySQL with Drizzle ORM
- **Authentication**: Manus OAuth 2.0
- **Styling**: Plus Jakarta Sans typography, Globalpack blue color scheme

## Core Workflows

### 1. User Registration & Approval

**Flow:**
1. New user registers via Manus OAuth
2. Account created with `registrationStatus: "pending"`
3. User cannot access dropshipping features until approved
4. Admin approves registration via admin console
5. User gains access to dashboard and activation flow

**Key Endpoints:**
- `users.getCurrent()` - Get current user profile
- `users.getAll()` - Admin only: List all users
- `users.updateRegistrationStatus()` - Admin only: Approve/reject registrations

### 2. Activation Fee Payment (M-Pesa)

**Flow:**
1. User views dashboard with KSH 500 activation fee notice
2. User submits M-Pesa transaction code via form
3. Admin reviews transaction code
4. Admin approves or rejects the payment
5. Upon approval, user's `activationStatus` becomes "active"

**Key Endpoints:**
- `activation.submitPaymentCode()` - User submits M-Pesa code
- `activation.getMyRequests()` - User views their payment requests
- `activation.approveRequest()` - Admin approves payment
- `activation.rejectRequest()` - Admin rejects payment

**Payment Code Format:**
- Expected format: M-Pesa confirmation code (e.g., "RH123ABC")
- Amount: KSH 500 (fixed)
- Status: "pending" → "approved"/"rejected"

### 3. Pickup Request Management

**Flow:**
1. User (must be approved and activated) requests pickup
2. Request created with `pickupStatus: "pending"`
3. Admin reviews pickup request
4. Admin approves or rejects
5. Upon approval, status changes to "approved_for_pickup"
6. After pickup completion, status becomes "completed"

**Key Endpoints:**
- `pickups.requestPickup()` - User requests pickup
- `pickups.getMyRequests()` - User views their pickup requests
- `pickups.approveRequest()` - Admin approves pickup
- `pickups.rejectRequest()` - Admin rejects pickup
- `pickups.completePickup()` - Admin marks pickup as completed

**Access Control:**
- Only users with `registrationStatus: "approved"` AND `activationStatus: "active"` can request pickups
- Regular users cannot access admin approval procedures

### 4. Withdrawal Request Management

**Flow:**
1. User (must be approved and activated) requests withdrawal
2. Specifies amount and M-Pesa number
3. Request created with `status: "pending"`
4. Admin reviews withdrawal request
5. Admin approves or rejects
6. Upon approval, status changes to "completed"

**Key Endpoints:**
- `withdrawals.requestWithdrawal()` - User requests withdrawal
- `withdrawals.getMyRequests()` - User views their withdrawal requests
- `withdrawals.completeWithdrawal()` - Admin approves and completes withdrawal
- `withdrawals.rejectWithdrawal()` - Admin rejects withdrawal

**Withdrawal Details:**
- User specifies M-Pesa number for fund transfer
- Admin verifies and processes payment
- Status tracking: "pending" → "completed"/"rejected"

### 5. Shipment Tracking

**Flow:**
1. Admin creates shipments for users
2. Each shipment has tracking number, destination, status, and profit
3. User views all shipments on dashboard
4. Real-time profit calculation

**Key Endpoints:**
- `shipments.getMyShipments()` - User views their shipments
- `shipments.getUserProfit()` - Calculate total profit for user

**Shipment Statuses:**
- "in_transit" - Shipment in delivery
- "delivered" - Shipment delivered
- "pending" - Awaiting pickup

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  openId VARCHAR(64) UNIQUE NOT NULL,
  name TEXT,
  email VARCHAR(320),
  loginMethod VARCHAR(64),
  role ENUM('user', 'admin') DEFAULT 'user',
  registrationStatus ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  activationStatus ENUM('inactive', 'active') DEFAULT 'inactive',
  pickupStatus ENUM('pending', 'approved_for_pickup', 'completed') DEFAULT 'pending',
  activationFeePaid BOOLEAN DEFAULT FALSE,
  adminNotes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  lastSignedIn TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Activation Requests Table
```sql
CREATE TABLE activation_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  mpesaTransactionCode VARCHAR(50) NOT NULL,
  amount VARCHAR(20) NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  adminNotes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

### Pickup Requests Table
```sql
CREATE TABLE pickup_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  status ENUM('pending', 'approved_for_pickup', 'completed') DEFAULT 'pending',
  adminNotes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

### Withdrawal Requests Table
```sql
CREATE TABLE withdrawal_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  amount VARCHAR(20) NOT NULL,
  mpesaNumber VARCHAR(20) NOT NULL,
  status ENUM('pending', 'completed', 'rejected') DEFAULT 'pending',
  adminNotes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

### Shipments Table
```sql
CREATE TABLE shipments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  trackingNumber VARCHAR(50) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  status ENUM('pending', 'in_transit', 'delivered') DEFAULT 'pending',
  profit VARCHAR(20) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

## Access Control

### User Roles

**Regular User (role: "user")**
- Can view own dashboard
- Can submit M-Pesa activation codes
- Can request pickups (if approved and activated)
- Can request withdrawals (if approved and activated)
- Can view own shipments and profit
- Cannot access admin console
- Cannot approve/reject any requests

**Admin (role: "admin")**
- Can access admin console
- Can view all users
- Can approve/reject user registrations
- Can approve/reject activation payment codes
- Can approve/reject pickup requests
- Can complete/reject withdrawal requests
- Can manage all shipments
- Can add admin notes to requests

### Protected Procedures

All procedures are protected with role-based access control:

```typescript
// Admin-only procedures
adminProcedure: protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
  return next({ ctx });
});

// User-only procedures
protectedProcedure: requires authentication
```

## Frontend Routes

### Public Routes
- `/` - Landing page with "Start Your Journey" CTA

### Protected User Routes
- `/dashboard` - User dashboard (redirects to login if not authenticated)
- `/dashboard/activation` - M-Pesa activation fee submission
- `/dashboard/shipments` - Shipment tracking
- `/dashboard/withdrawals` - Withdrawal requests

### Protected Admin Routes
- `/admin` - Admin console (redirects to login if not admin)
- `/admin/users` - User management and approval
- `/admin/activations` - Activation fee approvals
- `/admin/pickups` - Pickup request management
- `/admin/withdrawals` - Withdrawal request processing

## Error Handling

### Common Error Codes

- `UNAUTHORIZED` - User not authenticated
- `FORBIDDEN` - User lacks permission for the action
- `BAD_REQUEST` - Invalid input parameters
- `NOT_FOUND` - Resource not found
- `INTERNAL_SERVER_ERROR` - Server error

### Example Error Response

```json
{
  "code": "FORBIDDEN",
  "message": "Account must be approved and activated to request withdrawal"
}
```

## Testing

The platform includes comprehensive test coverage:

- **Auth Flow Tests** (`server/auth.flows.test.ts`): 9 tests
  - User registration and pending status
  - Protected route access
  - Admin access control
  - Logout flow

- **Workflow Tests** (`server/workflows.test.ts`): 13 tests
  - Admin-only procedure access
  - User access restrictions
  - Approval workflow enforcement
  - Permission checks

- **Auth Logout Tests** (`server/auth.logout.test.ts`): 1 test
  - Session cookie clearing

**Run tests:**
```bash
pnpm test
```

## Deployment

### Build for Production

```bash
pnpm build
```

This creates:
- `dist/public/` - Frontend static files
- `dist/index.js` - Backend server bundle

### Environment Variables

Required for production:
- `DATABASE_URL` - MySQL connection string
- `JWT_SECRET` - Session signing secret
- `VITE_APP_ID` - Manus OAuth app ID
- `OAUTH_SERVER_URL` - Manus OAuth server URL
- `VITE_OAUTH_PORTAL_URL` - Manus login portal URL

### Start Production Server

```bash
NODE_ENV=production node dist/index.js
```

## Branding & Styling

### Color Scheme
- Primary Blue: `#2563eb` (Tailwind blue-600)
- Dark Blue: `#1e40af` (Tailwind blue-800)
- Success Green: `#16a34a` (WhatsApp button)

### Typography
- Font Family: Plus Jakarta Sans
- Loaded via Google Fonts CDN

### UI Components
- Built with shadcn/ui
- Tailwind CSS 4 for styling
- Responsive design (mobile-first)

### Branding Elements
- Globalpack logo and name on all pages
- UK flag indicator (🇬🇧) on key pages
- WhatsApp floating action button (bottom-right)
- Toast notifications for user feedback

## Support

For issues or questions about the API:
1. Check the test files for usage examples
2. Review the database schema for data structure
3. Consult the frontend components for UI implementation
4. Contact admin through WhatsApp: https://wa.me/message/AXBZCPUEDZJKE1
