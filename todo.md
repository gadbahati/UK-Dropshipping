# UK Dropshipping - Globalpack Platform TODO

## Phase 1: Database Schema & Data Models
- [x] Create users table with role, status, and registration approval fields
- [x] Create activation_requests table for M-Pesa payment tracking
- [x] Create pickup_requests table for pickup management
- [x] Create withdrawal_requests table for withdrawal management
- [x] Create shipments table for tracking shipments and profits
- [x] Define all relationships and indexes
- [x] Generate and apply database migrations

## Phase 2: Authentication & Registration
- [x] Implement user registration flow with "pending" status
- [x] Add admin approval procedure for new registrations
- [x] Implement role-based access control (user vs admin)
- [x] Create protected procedures for admin-only operations
- [x] Add authentication guards on routes
- [ ] Write tests for auth flows

## Phase 3: User Dashboard
- [x] Create dashboard layout with Globalpack branding
- [x] Add activation fee notice banner (KSH 500)
- [x] Display user account status (Pending/Approved/Rejected)
- [x] Show shipment tracking section
- [x] Add profit summary display
- [x] Make dashboard fully responsive
- [x] Add UK flag to dashboard header
- [x] Add WhatsApp live chat button

## Phase 4: Admin Console
- [x] Create admin dashboard layout with sidebar navigation
- [x] Build user directory/listing with filters
- [x] Add user approval/rejection workflows
- [x] Implement status update functionality
- [x] Create admin-only routes and procedures
- [x] Add role-based access guards
- [x] Make admin console fully responsive
- [x] Style admin console professionally

## Phase 5: M-Pesa Payment Integration
- [x] Create activation fee submission form
- [x] Build M-Pesa transaction code submission flow
- [x] Implement admin verification procedure
- [x] Add approval/rejection logic for payment codes
- [x] Create payment status tracking
- [x] Add validation for transaction codes

## Phase 6: Pickup & Withdrawal Management
- [x] Create pickup request submission form
- [x] Implement pickup status field (Pending/Approved/Completed)
- [x] Build withdrawal request form
- [x] Add withdrawal approval workflow
- [x] Create status tracking for both features
- [x] Implement admin management interface

## Phase 7: Styling & Responsiveness
- [x] Apply Globalpack blue color scheme throughout
- [x] Use Plus Jakarta Sans typography consistently
- [x] Ensure all pages are mobile-responsive
- [x] Add toast notifications for user feedback
- [ ] Test on multiple screen sizes
- [x] Verify WhatsApp button placement
- [x] Add motivational messaging to key pages

## Phase 8: Testing & Deployment
- [x] Write integration tests for approval workflows
- [x] Test all user journeys end-to-end
- [x] Verify admin-only access restrictions
- [x] Test responsive design on mobile/tablet
- [x] Create final checkpoint
- [x] Prepare for deployment

## Branding Requirements
- [x] Preserve Globalpack name and logo
- [x] Use blue color scheme (#2563eb primary, #1e40af dark)
- [ ] Use Plus Jakarta Sans font family
- [ ] Keep WhatsApp floating button
- [ ] Maintain toast notification style
- [ ] Add UK flag to all key pages
