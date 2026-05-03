# Architecture

DailyBrew is multi-tenant: **Workspace** is the root aggregate, and every domain entity (Employee, Shift, Closure, LeaveRequest, Attendance, ApiToken, WorkspaceQrCode) belongs to exactly one Workspace. Cross-workspace access is impossible by construction — there are no APIs that list entities across workspaces, and every workspace-scoped controller routes through `App\Security\WorkspaceVoter` (`VIEW`, `MANAGE`, `EDIT`, `DELETE` attributes). `MANAGE` covers owner + manager actions like approving leave; `EDIT`/`DELETE` are owner-only.

Use the diagrams below to navigate the entity model and the three primary user flows (check-in, leave request, authentication).

## Project Structure

```
src/
  ApiController/          # API controllers
    Auth/                 # Login, register, OAuth
    Workspace/            # Workspace CRUD, settings, dashboard, API tokens
    Employee/             # Employee CRUD
    Shift/                # Shift CRUD
    Closure/              # Closure CRUD
    Attendance/           # Attendance log
    LeaveRequest/         # Leave request management
    Checkin/              # QR check-in endpoint (auth required)
    Device/               # Push notification device token registration
    BasilBook/            # External API for BasilBook integration
    Paddle/               # Paddle webhook handler
    Plan/                 # Plan/subscription info
    Dev/                  # Dev-only endpoints (plan toggle)
  Entity/                 # Doctrine entities
  Repository/             # Doctrine repositories
  Service/                # Business logic
  Security/               # WorkspaceVoter, BasilBookApiKeyAuthenticator
  Enum/                   # Plan, LeaveRequestStatus, SubscriptionStatus
  EventSubscriber/        # Exception handling, rate limiting

assets/src/
  routes/                 # TanStack Router file-based routes
  components/
    dashboard/            # OwnerDashboard, EmployeeDashboard
    layout/               # Sidebar, WorkspaceSwitcher, PageHeader
    shared/               # GlassCard, CustomSelect, CustomDatePicker, etc.
    landing/              # Landing page sections
  hooks/
    queries/              # TanStack Query hooks (useWorkspaces, usePlan, etc.)
  lib/                    # API client (apiAxios), auth, utils (cn)
  types/                  # TypeScript interfaces
  i18n/                   # Translation files (en, fr, km)
```

## Entity-Relationship Model

```mermaid
erDiagram
    User {
        int id PK
        uuid publicId UK
        string email UK
        string password
        string googleId
        string appleId
        datetime createdAt
        datetime updatedAt
    }

    Workspace {
        int id PK
        uuid publicId UK
        string name
        string qrToken UK
        datetime createdAt
        datetime updatedAt
    }

    WorkspaceSetting {
        int id PK
        boolean ipRestrictionEnabled
        json allowedIps
        boolean deviceVerificationEnabled
        string timezone
        string dateFormat
        boolean geofencingEnabled
        float geofencingLatitude
        float geofencingLongitude
        int geofencingRadiusMeters
    }

    Shift {
        int id PK
        uuid publicId UK
        string name
        time startTime
        time endTime
        datetime createdAt
        datetime updatedAt
    }

    Closure {
        int id PK
        uuid publicId UK
        string name
        date startDate
        date endDate
        datetime createdAt
    }

    Employee {
        int id PK
        uuid publicId UK
        string firstName
        string lastName
        string username UK
        string phoneNumber
        date dob
        date joinedAt
        enum role
        enum status
        datetime deletedAt
        datetime createdAt
        datetime updatedAt
    }

    Attendance {
        int id PK
        uuid publicId UK
        date date
        datetime checkInAt
        datetime checkOutAt
        boolean isLate
        boolean leftEarly
        string ipAddress
        string checkInDeviceId
        string checkInDeviceName
        string checkOutDeviceId
        string checkOutDeviceName
        datetime createdAt
        datetime updatedAt
    }

    LeaveRequest {
        int id PK
        uuid publicId UK
        date startDate
        date endDate
        time startTime
        time endTime
        text reason
        enum type
        enum status
        datetime reviewedAt
        datetime createdAt
        datetime updatedAt
    }

    DeviceToken {
        int id PK
        uuid publicId UK
        string token UK
        string platform
        datetime createdAt
        datetime updatedAt
    }

    ApiToken {
        int id PK
        uuid publicId UK
        string prefix
        string tokenHash UK
        string name
        datetime lastUsedAt
        datetime revokedAt
        datetime createdAt
    }

    User ||--o{ Workspace : owns
    User ||--o| Workspace : currentWorkspace
    User ||--o{ Employee : creates
    User ||--o{ Employee : linkedUser
    User ||--o{ DeviceToken : has

    Workspace ||--|| WorkspaceSetting : has
    Workspace ||--o{ Shift : has
    Workspace ||--o{ Closure : has
    Workspace ||--o{ Employee : contains
    Workspace ||--o{ ApiToken : has

    Shift ||--o{ Employee : assigned

    Employee ||--o{ Attendance : records
    Employee ||--o{ LeaveRequest : submits
```

## Flow Diagrams

### QR Check-in Flow

```mermaid
flowchart TD
    A[Employee scans QR code] --> B{Signed in?}
    B -- No --> C[Show sign-in required]
    B -- Yes --> D[Resolve employee from user + workspace]
    D --> E{Employee found?}
    E -- No --> F[403 Not registered]
    E -- Yes --> G{On approved full-day leave?}
    G -- Yes --> H[Block check-in: on leave]
    G -- No --> I{Closure today?}
    I -- Yes --> J[Block: workspace closed]
    I -- No --> K{IP restriction enabled?}
    K -- Yes --> L{IP allowed?}
    L -- No --> M[403 IP restricted]
    L -- Yes --> N{Device verification enabled?}
    K -- No --> N
    N -- Yes --> O{Device already used by another employee today?}
    O -- Yes --> P[403 Device already used]
    O -- No --> Q{Geofencing enabled?}
    N -- No --> Q
    Q -- Yes --> R{Within radius?}
    R -- No --> S[403 Outside geofence]
    R -- Yes --> T{Already checked in today?}
    Q -- No --> T
    T -- Yes --> U{Already checked out?}
    T -- No --> V[Create Attendance + check in]
    U -- Yes --> W[Show completed state]
    U -- No --> X{Device verification enabled?}
    X -- Yes --> Y{Same device as check-in?}
    Y -- No --> Z[403 Device mismatch]
    Y -- Yes --> AA[Check out]
    X -- No --> AA
    V --> AB[Compute isLate from shift]
    AA --> AC[Compute leftEarly from shift]
```

### Leave Request Flow

```mermaid
flowchart TD
    A[Employee submits leave request] --> B{startDate <= endDate?}
    B -- No --> C[400 Invalid dates]
    B -- Yes --> D{Overlaps with closure?}
    D -- Yes --> E[409 Conflicts with closure]
    D -- No --> F{Overlaps existing pending/approved leave?}
    F -- Yes --> G[409 Duplicate leave]
    F -- No --> H[Create LeaveRequest - status: pending]
    H --> I[Notify workspace owner - push + email]
    I --> J{Owner/manager reviews}
    J --> K[Approve]
    J --> L[Reject]
    K --> M[Status: approved + notify employee]
    L --> N[Status: rejected + notify employee]
    H --> O{Employee cancels?}
    O --> P[Delete pending request]
```

### Authentication Flow

```mermaid
flowchart TD
    A[User opens app] --> B{Has JWT token?}
    B -- Yes --> C{Token valid?}
    C -- Yes --> D[Load workspace from server/localStorage]
    C -- No --> E[Redirect to sign-in]
    B -- No --> E
    E --> F{Auth method}
    F --> G[Email + password]
    F --> H[Google OAuth]
    F --> I[Apple OAuth]
    G --> J[POST /auth/login]
    H --> K[POST /auth/google]
    I --> L[POST /auth/apple]
    J --> M[Return JWT]
    K --> M
    L --> M
    M --> N{First login / no workspace?}
    N -- Yes --> O[Onboarding wizard]
    N -- No --> D
    O --> P{Choose role}
    P --> Q[Owner: create workspace]
    P --> R[Employee: link to workspace]
```
