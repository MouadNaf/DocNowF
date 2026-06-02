# Notification System Implementation Plan

This document outlines the proposed implementation plan for the Notification System on the healthcare platform, using React, Ant Design, and Laravel.

## User Review Required

> [!WARNING]  
> Before proceeding, please review the proposed architecture below. The plan involves installing new dependencies (`antd`), adding backend API routes, creating a new `NotificationController`, and modifying several layout components on the frontend. 

## Open Questions

> [!IMPORTANT]  
> 1. Do you want to restrict the `antd` library only to the notifications components to avoid conflicting with your existing Tailwind CSS design, or are you comfortable using it globally if needed? 
> 2. For Real-time updates, you mentioned "Refresh every 30 seconds" for now. Should we use a background polling mechanism in React Query (`refetchInterval`), or a custom `setInterval`? (I recommend React Query's built-in polling).

## Proposed Changes

---

### Backend (Laravel API)

The database already contains a `Notification` model, but we need to implement the API endpoints and logic to interact with it.

#### [NEW] `app/Http/Controllers/NotificationController.php`
Create a controller to handle the API endpoints for notifications:
* `index()`: Fetch paginated notifications, optionally filtered by `unread`.
* `unreadCount()`: Get the count of unread notifications for the logged-in user.
* `markAsRead($id)`: Mark a specific notification as read.
* `markAllAsRead()`: Mark all unread notifications as read.
* `destroy($id)`: Delete a specific notification.

#### [MODIFY] `routes/api.php`
Add the new notification endpoints within the authenticated middleware group:
* `GET /notifications`
* `GET /notifications/unread-count`
* `PUT /notifications/{id}/read`
* `PUT /notifications/read-all`
* `DELETE /notifications/{id}`

---

### Frontend (React & Ant Design)

#### 1. Dependencies
Install `antd` via npm to provide the Badge, Dropdown, List, and Pagination components requested.

#### 2. Services & Hooks
#### [NEW] `src/services/notificationService.ts`
Implement the API calls matching the new backend endpoints using Axios.

#### [NEW] `src/hooks/useNotifications.ts`
Create React Query hooks (`useQuery`, `useMutation`) to wrap the `notificationService`. This will include the 30-second polling logic for `unreadCount` and `latestNotifications`.

#### 3. UI Components (Navbar Integration)
#### [NEW] `src/components/notifications/NotificationBell.tsx`
A wrapper around the Bell icon using Ant Design's `<Badge count={unreadCount}>`.

#### [NEW] `src/components/notifications/NotificationDropdown.tsx`
The Ant Design `<Dropdown>` overlay displaying the latest 5 notifications and a "View All Notifications" link.

#### [NEW] `src/components/notifications/NotificationItem.tsx`
A component to render an individual notification with an unread dot, Title, Message, and Time Ago (using `date-fns`).

#### [MODIFY] Layout Components
Replace the existing Lucide `<Bell />` icon with our new `<NotificationBell />` in the following files:
* `src/components/ui/TopNav.tsx`
* `src/components/layout/SecretaryTopbar.tsx`
* `src/widgets/layout/AdminLayout.tsx`
* `src/widgets/layout/PatientLayout.tsx`

#### 4. Notifications Page
#### [NEW] `src/pages/notifications/NotificationsPage.tsx`
A dedicated page accessible at `/notifications` featuring:
* Full list of notifications using Ant Design's `<List>` component.
* Pagination controls.
* Filter controls (All, Unread).
* Action buttons ("Mark all as read", "Delete").

#### [MODIFY] `src/App.tsx` (or Router config)
Add the new `/notifications` route for all authenticated users (Admin, Doctor, Secretary, Patient).

---

## Verification Plan

### Automated Tests
* N/A for this task, but we will rely on strict TypeScript typing to catch interface issues.

### Manual Verification
1. Log into the application as different roles (Doctor, Patient, Secretary).
2. Manually trigger a notification (e.g., booking an appointment) or manually insert one in the database.
3. Observe the red badge count update automatically on the Bell Icon within 30 seconds.
4. Click the Bell Icon to verify the dropdown shows the latest 5 notifications correctly formatted.
5. Click "View All Notifications" to navigate to `/notifications` and verify pagination and filtering work.
6. Test "Mark as Read" and "Delete" actions and ensure the UI and backend sync correctly.
