# Pizza App Architecture (Living Document)

## Purpose

This document captures the current architecture and constraints used by spec-driven stories.

## Current Stack

- Frontend: React + Vite
- Routing: React Router
- Backend/Data: Supabase (tables, views, RPC)

## Current Domain Model (As-Is)

- Orders currently map to a single pizza type and quantity.
- Time slot availability is currently read from a view.
- Admin currently reads a flat order list.

## Target Domain Model (To-Be)

- Parent order with multiple child order items.
- Each order item maps to:
  - menu item
  - quantity
  - time slot
- Reservation entity/logic with 3-minute TTL for slot holds.
- Payment status tracked at order level.

## System Constraints

- Time slot capacity: max 2 pizzas per slot.
- Availability must include both confirmed orders and active reservations.
- Checkout submit must be atomic.

## Integration Notes

- Online payment is optional phase 2.
- MVP must support cash at pickup and admin paid-state tracking.

## Open Architecture Questions

1. Where reservation records should be stored and expired (DB job vs app worker)?
2. How to prevent race conditions under concurrent checkout attempts?
3. What audit fields are required for admin payment updates?
