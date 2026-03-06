# Milestone 3: Full-Stack Integration

**Gavin Lanno** | March 2026 | GitHub Repository  
**SDLC Phase:** Implementation

---

# 🏘️ Buckeye Sublease

Buckeye Sublease is a two-sided digital marketplace that connects students and landlords seeking to list leases or subleases with individuals searching for short-term or flexible housing.

This milestone focused on building out the **full-stack integration between the React frontend and the ASP.NET backend API.**

---

# 📋 Document Layout

1. Kanban and Prioritization  
2. Systems Architecture Diagram  
3. Database Schema Design  
4. Architecture Decision Records  
5. Component Architecture  
6. AI Tool Usage  

---

# 📅 GitHub Kanban and Prioritization

- Synced issues in the `amis4630` repository to the Kanban project.
- Prioritized items based on the **MVP for persona Ethan Collins**, who is making a sublease listing.

In order for a buyer to pick a listing, listings must exist first, which is why development began with the **seller persona**.

---

# ⚙️ Systems Architecture Diagram

```
Users (Browser)
        |
        | HTTPS
        v
+---------------------------+
| Frontend (React)          |
| - UI / routing            |
| - Calls APIs (REST)       |
| - Admin views (role-based)|
+---------------------------+
        |
        | HTTPS (JSON) + Authorization: Bearer <JWT>
        v
+-----------------------------------+
| Backend API (ASP.NET)             |
| - Auth (JWT validation)           |
| - Controllers / endpoints         |
| - Business logic                  |
| - Data access (EF Core / SQL)     |
| - Stores file URLs/metadata       |
+-----------------------------------+
        |
        | SQL connection
        v
+---------------------------+
| Database (SQL)            |
| - Users, posts, logs      |
| - Constraints, indexes    |
+---------------------------+
```

**Data Flow**

Frontend ←→ Backend

1. User action triggers frontend interaction  
2. Frontend sends HTTP request (JSON)  
3. Backend validates JWT and executes logic  
4. Backend queries database  
5. Backend returns JSON response  
6. Frontend updates UI  

---

# 🛠️ How It Works

The frontend includes a **JWT (JSON Web Token)** in the `Authorization` header of API requests.

The JWT contains:

- **Header** — signing algorithm  
- **Payload** — user claims (user ID, role)  
- **Signature** — verifies token authenticity  

The backend validates the token to **authenticate and authorize the user** before executing business logic and querying the database.

---

# 🫙 Database Schema Design

### ERD Relationships

```
USER ||--|| PROFILE : has
USER ||--o{ LISTING : posted_by
PROPERTY ||--o{ LISTING : located_at
LISTING ||--o{ LISTING_IMAGE : has
USER ||--o{ SAVED_LISTING : saves
LISTING ||--o{ SAVED_LISTING : is_saved
USER ||--o{ LISTING_VIEW : views
LISTING ||--o{ LISTING_VIEW : is_viewed
USER ||--o{ INQUIRY : sends
LISTING ||--o{ INQUIRY : receives
```

---

# 📚 How ERD Supports User Stories

**Account + Identity**

- A `User` has exactly one `Profile`, enabling user details and trust context.

**Posting Listings**

- A `User` can post many listings, supporting leaseholders creating postings.

**Location Association**

- A `Property` can have many listings, allowing relisting or multiple units at one address.

**Listing Media**

- A listing can have many images, enabling photo galleries.

**Buyer Behavior**

- Users can save listings and view listings via junction tables:
  - `SavedListing`
  - `ListingView`

**Buyer–Seller Communication**

- Users can send inquiries on listings through the `Inquiry` relationship.

---

# 💽 Architecture Decision Records

## 💻 Technology Used

### ADR 1 — Frontend

**Decision:** React with TypeScript

**Reasoning**

- Reusable UI components (listing cards, profiles)
- Widely used industry standard
- Open-source and maintained by Meta
- Easy to learn

---

### ADR 2 — Backend

**Decision:** ASP.NET with C#

**Reasoning**

- Flexible across application types
- Compile-time error detection
- Built-in database access
- Open-source and maintained by Microsoft
- Enterprise-grade
- Smooth Azure integration

---

# 📦 Component Architecture

This section decomposes the property listing UI using **Atomic Design Methodology**.

## Atoms

- Button  
- Input  
- Image  
- Text  
- Icon  

## Molecules

- Search Bar  
- Price display  
- Location display  
- Profile info display  

## Organisms

- Listing component / card  
- Filter sidebar  
- Listing grid  
- Infinite scroll trigger  

## Templates

- Listing catalog grid template  
- Listing catalog map template  

---

# 🤖 AI Tool Usage

**AI Tool Used:** Claude (claude.ai)

This milestone involved AI assistance for scaffolding the full-stack integration.

Below is a summary of what AI helped with, what was modified, and where personal judgment was applied.

---

# Backend Assistance

### Help Requested

- Verification that `ListingsController` met assignment requirements:
  - Two endpoints
  - In-memory data
  - 404 handling
  - CORS
- Static file serving for images stored in `wwwroot`
- Whether `DateTime` is valid for `PostedDate`

### Prompts Used

```
Here are my backend files [ListingStore.cs, Listing.cs, ListingsController.cs, Program.cs] — can you verify these requirements are met?

I'm saving my images in my backend wwwroot folder — does that change how the frontend receives it?

My static data has ImageURL = './wwwroot/images/...' — do I need the entire file path?
```

### What Was Accepted

- Confirmation controller structure was correct
- Explanation of how `wwwroot` is removed from the URL
- Adding `app.UseStaticFiles()` to `Program.cs`

### Personal Judgment

- Maintained **ListingsController naming** instead of ProductsController to match the real estate domain.

---

# Frontend Assistance

### Help Requested

- How to split a monolithic `App.tsx` into reusable components
- Component scaffolding
- React Router setup
- Empty state UI

### Prompts Used

```
Currently I have my App.tsx and App.css with everything in it — how should I break it up to promote reusability?

Let's do it!

Can you verify that all of these requirements are met?

Yes please
```

### What Was Accepted

- `pages/` + `components/` folder structure
- `Listing.ts` type file mirroring the C# model
- React Router setup
- Empty state handling

### What Was Modified

- Prefixed image sources with `https://localhost:7000` after understanding static file serving.

### Personal Judgment

- Maintained domain-specific component names:
  - `ListingCard`
  - `ListingDetail`
- Kept data fetch in `App.tsx` to avoid redundant network calls.

---

# Independent Decisions

- Renamed marketplace entities to match **Buckeye Sublease domain**
- Reviewed all scaffolded code before accepting
- Corrected image path logic after understanding `UseStaticFiles`
- Verified correct `.NET port` in `launchSettings.json`

---

# 🤖 Previous Milestone AI Usage (ChatGPT)

### Systems Architecture Diagram

Prompt:

```
Can you make a high-level system architecture showing major components
(frontend, backend, database) and how they interact.
```

Follow-up:

```
This is my finished work, what are your thoughts?
```

---

### Entity Relationship Diagram

Prompts:

```
Now I need to make a Database Schema Design using these instructions.
Here is my brainstorm: [relationships list]. Can you double check these entities?
```

```
Can you make an ERD using Mermaid format with the following:
[entities and relationships]
```

```
Do you think my professor will understand that?
I want to be honest and understand it myself.
```

---

# End of Document