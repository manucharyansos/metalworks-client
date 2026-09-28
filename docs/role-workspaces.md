# MetalWorks role workspaces

This document describes the production workspaces used by the client UI.

## Admin
Full system management.

## Manager
- Orders
- Clients
- Employees
- Users and individual permissions
- Materials
- Laser cutting management
- Bending management
- Powder coating management

Managers use dedicated production-management pages so operator ownership does not block viewing or editing production orders.

## Engineer
- My orders
- Create order
- PMP projects and files
- PMP file viewer

Engineer pages are permission-aware and available in Armenian, Russian, and English.

## Laser cutting
Dedicated production board for the employee's assigned workshop, including order details, DXF/file access and permitted status updates.

## Bending
Dedicated production board for the employee's assigned workshop, including order details, file access and permitted status updates.

## Powder coating
Dedicated production board for the employee's assigned workshop, including order details, file access and permitted status updates.

## Access rules
Admin and Manager have full business access. Other employee roles receive individual permissions constrained to their role scope. Production employees also require a workshop assignment.
