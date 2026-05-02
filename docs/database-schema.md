# Buckeye Sublease Database Schema

## Overview

This schema reflects the implemented EF Core model in [`backend/HelloWorldApi/Data/LisitngContext.cs`](../backend/HelloWorldApi/Data/LisitngContext.cs) and the model classes under [`backend/HelloWorldApi/Models/`](../backend/HelloWorldApi/Models). It documents the current database, not the broader milestone-era aspirational ERD.

## Entity Summary

- `Category`: seeded listing categories
- `Listing`: active and soft-deleted property listings
- `Cart`: one persisted cart per guest session or authenticated user
- `CartItem`: listing rows stored in a cart
- `GuestSession`: guest cart identity and expiration
- `AuthUser`: registered users and seeded admin users
- `RefreshToken`: hashed refresh tokens for auth sessions
- `Order`: placed orders for authenticated users
- `OrderItem`: snapshot of purchased listing data at checkout time

## ERD

```mermaid
erDiagram
    CATEGORY ||--o{ LISTING : classifies
    CART ||--o{ CART_ITEM : contains
    LISTING ||--o{ CART_ITEM : referenced_by
    CATEGORY ||--o{ CART_ITEM : copied_into
    CART ||--o| GUEST_SESSION : identified_by
    AUTH_USER ||--o{ REFRESH_TOKEN : owns
    AUTH_USER ||--o{ ORDER : places
    ORDER ||--o{ ORDER_ITEM : contains

    CATEGORY {
        int Id PK
        string Name
    }

    LISTING {
        int Id PK
        string Address
        string Description
        decimal Price
        int CategoryId FK
        string SellerName
        datetime PostedDate
        string ImageURL
        bool IsActive
    }

    CART {
        int Id PK
        string UserId
        datetime CreatedAt
    }

    CART_ITEM {
        int Id PK
        int CartId FK
        int ListingId FK
        int CategoryId FK
        int Quantity
    }

    GUEST_SESSION {
        int Id PK
        string SessionId
        int CartId FK
        datetime CreatedAtUtc
        datetime ExpiresAtUtc
    }

    AUTH_USER {
        int Id PK
        string UserId
        string Email
        string Role
        string PasswordHash
    }

    REFRESH_TOKEN {
        int Id PK
        int AuthUserId FK
        string TokenHash
        datetime CreatedAtUtc
        datetime ExpiresAtUtc
        datetime RevokedAtUtc
    }

    ORDER {
        int Id PK
        int AuthUserId FK
        datetime OrderDateUtc
        string Status
        decimal Total
        string ShippingAddress
        string ConfirmationNumber
    }

    ORDER_ITEM {
        int Id PK
        int OrderId FK
        int ListingId
        string Address
        string ImageURL
        string CategoryName
        decimal Price
        int Quantity
        decimal LineTotal
    }
```

## Notes

- `Listing.IsActive` implements soft delete for admin listing removal.
- `Cart.UserId` stores either an authenticated user ID or a generated `guest:<sessionId>` identifier.
- `GuestSession` provides 24-hour guest cart continuity through the `X-Session-Id` header.
- `OrderItem` intentionally snapshots listing fields such as address, image URL, category name, and price so historical orders are stable even if a listing changes later.
- `AuthUser.UserId` and `AuthUser.Email` are both unique indexes.
- `RefreshToken.TokenHash` is a unique index, and refresh tokens cascade-delete with their owning `AuthUser`.
