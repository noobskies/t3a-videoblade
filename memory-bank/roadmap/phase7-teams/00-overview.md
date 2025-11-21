# Phase 7: Team & Workspace Features

## Overview

This phase transforms MediaBlade from a single-user tool to a collaborative platform using **Workspaces**. We are leveraging the **Better Auth Organization Plugin** to handle the core logic.

**Strategy**: Fresh Start (No Migration). The database will be reset to enforce strict Organization ownership.

## Goals

1.  **Multi-Tenancy**: Data is isolated by `Organization`, not `User`.
2.  **Collaboration**: Users can invite others to their workspace.
3.  **Roles**: Owner, Admin, Member controls.

## Implementation Plan

### Step 1: Infrastructure (Current)

- [ ] Update `src/server/auth.ts` to include `organization` plugin.
- [ ] Update `prisma/schema.prisma` with Organization models.
- [ ] Refactor existing models (`Post`, etc.) to use `organizationId`.
- [ ] Reset Database (`db:push`).

### Step 2: Backend Refactor

- [ ] Update `trpc` context to include `activeOrganizationId`.
- [ ] Update `post.router` to filter by Organization.
- [ ] Update `platform.router` to filter by Organization.
- [ ] Update `analytics.router` to filter by Organization.
- [ ] Update Inngest functions (if necessary).

### Step 3: Frontend Implementation

- [ ] **Sidebar**: Add Workspace Switcher.
- [ ] **Settings**: Add "Team Members" page.
- [ ] **Onboarding**: Ensure new users create/join an organization.

## Key Schema Changes

- **New**: `Organization`, `Member`, `Invitation`.
- **Modified**: `Post`, `PlatformConnection`, `Idea`, `PublishJob` now belong to `Organization`.
