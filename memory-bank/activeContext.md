# Active Context

## Current Focus: Team & Workspace Features (Phase 7)

We have transitioned the application from a single-user model to a multi-tenant **Workspace** model. This involved a destructive database reset and major backend refactoring.

### Recent Changes (2025-11-21)

1.  **Architecture Shift: Workspaces**
    - **Schema**: Introduced `Organization`, `Member`, `Invitation`.
    - **Ownership**: Moved resource ownership (`Post`, `PlatformConnection`, etc.) from `User` to `Organization`.
    - **Database**: Reset database to apply these breaking changes.

2.  **Backend Refactoring**
    - **Auth**: Integrated Better Auth `organization` plugin.
    - **TRPC**: Created `organizationProcedure` to enforce active organization context.
    - **Routers**: Updated all routers (`post`, `platform`, `comment`, etc.) to filter by `organizationId` instead of `userId`.

3.  **Frontend Implementation**
    - **Sidebar**: Added **Workspace Switcher** and "Create Workspace" functionality.
    - **Settings**: Added `/settings/members` for Team Management (Invite/Remove members).
    - **Auth Client**: Configured `organizationClient` plugin.

4.  **Cleanup**
    - Removed legacy `components.json` and verified Tailwind removal.

## Active Decisions

- **Strict Multi-Tenancy**: All operations require an active organization. The `organizationProcedure` middleware enforces this.
- **Fresh Start**: We opted for a fresh database start instead of complex migration logic for existing single-user data.

## Next Steps

1.  **Phase 7 Polish**:
    - Improve "No Workspace" state (onboarding flow).
    - Add Role-Based Access Control (RBAC) checks in routers (currently just Org membership).
2.  **Resume Phase 5**: X (Twitter) integration.
3.  **Production Hardening**: Verify Inngest functions in the new multi-tenant environment.
