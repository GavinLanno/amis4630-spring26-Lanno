

<h1>Milestone 2: Architecture Design & Frontend Foundation</h1>

Gavin Lanno  |   February 15<sup>th</sup>  |  [`Github Repository Link`](https://github.com/GavinLanno/amis4630-spring26-Lanno) <br>
SDLC Phase: Design <br> <br>



<h2>🏘️Buckeye Sublease</h2>

Buckeye Sublease is a two-sided digital marketplace that connects students and landlords seeking to list leases or subleases with individuals searching for short-term or flexible housing. The platform allows users to create detailed property listings that include pricing, availability, location, housing type, and photos. Users also create profiles to evaluate compatibility and credibility, enabling both housing search and roommate discovery within a single system. The platform supports apartments, duplexes, quadplexes, and houses, and facilitates efficient matching, listing management, and communication between parties. <br>

---

<h2>📋Document Layout</h2>

    1. Kanban and Prioritization
    2. Systems Architecture Diagram
    3. Database Schema Design 
    4. Archetecture Design Records 
    5. Component Architecture
    6. Prompts

---

<h2>📅GitHub Kanban and Prioritization </h2>

- Synced issues in amis4630 repository to the kanban project <br>
- Prioritized items based on the MVP for persona Ethan Collins, who is making a sublease listing.  In order for a buyer to pick a listing there needs to be listings already which is why I started with the seller persona. <br>
- Github Project [`Kanban and Prioritization`](https://github.com/users/GavinLanno/projects/1) <br>
-	Synced issues in amis4630 repository to the kanban project <br>

---

<h2>⚙️Systems Architecture Diagram</h2>

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
        | SQL connection (conn string / managed identity)
        v
+---------------------------+
| Database (SQL)            |
| - Users, posts, logs      |
| - Constraints, indexes    |
+---------------------------+
```

<h3>Frontend <---> Backend</h3>
User action → Frontend sends HTTP request (JSON) → Backend validates JWT + executes logic →
Backend queries DB → Backend returns JSON → Frontend updates UI. <br> <br>

<h3>🛠️How it works</h3>
The frontend includes a JWT (JSON Web Token) in the Authorization header of API requests. The JWT contains a header (signing algorithm), payload (user claims such as ID and role), and signature. The backend validates the token to authenticate and authorize the user before executing business logic and querying the database. <br>

---

<h2>🫙Database Schema Design</h2>

```
ERDiagram
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

  Key
    || = exactly one
    o{ = zero or many
    |{ = one or many
    }o = zero or many (reverse side)
    -- = relationship line

    : has = label describing the relationship
```

<h3>📚How ERD Supports User Stories</h3>

- Account + identity: A User has exactly one Profile, enabling user details and trust context.
- Posting listings: A User can post many listings, supporting sellers/leaseholders creating postings.
- Location association: A Property can have many Listings, supporting relisting or multiple units at the same address.
- Listing media: A listing can have many images, supporting photo galleries.
- Buyer behavior: Users can save listings and view listings through junction tables (SavedListing, ListingView).
- Buyer–seller communication: Users can send inquiries on listings through the Inquiry relationship (User ↔ Listing), supporting initial contact and lead tracking.

---

<h2>💽Architecture Decision Records</h3>

<h3>💻Technology Used</h3>

*ADR 1* — Frontend <br>
Decision: React w/ TypeScipt <br>
Reasoning: <br>
- Allows easy build-up of UIs from `reusable components` (Ex. Listing cards and profiles)
- Universally used and `industry standard`
- `Open sourced` and `maintained` by Meta
- Easy to learn
<br>

*ADR 2* — Backend <br>
Decision: ASP.NET w/ C# <br>
Reasoning: <br>
- Can be applied to various application purposes (Ex. Gaming and busines)
- C# catches errors at compile time opposed to run time
- Built-in database access
- Open sourced and maintained by Microsoft
- Enterprise-Grade
- Smooth Azure integration
<br>

<h3>🤖Prompt Documentation</h3>    
AI's used: ChatGPT <br>

```
Systems Architecture Diagram

Prompt: Can you make a High-level system architecture showing major components (frontend, backend, database) and how they interact.
    Note: Chat GPT remembers helping me on previous assignments

Prompt: This is my finished work, what are your thoughts {Diagram and explainations}

Prompt:
    Sweet I took your feedback and wrote this
    <h3>Frontend <---> Backend</h3>
    User action → Frontend sends HTTP request (JSON) → Backend validates JWT + executes logic →
    Backend queries DB → Backend returns JSON → Frontend updates UI. <br> <br>
    
    <h3>🛠️How it works</h3>
    The frontend connects the the backend using a JWT (JSON Web Tokens), which includes its encoding type(head),
    the queries (payload), and the signature to verify the sender. <br>

```
---
```
Entity Relationship Diagram

Prompt:
    Now I need to make a Database Schema Design, using these instructions: {Assignment instructions}
    Here is my brainstorm:
    A user can make many listings
    A user can view many listing A user can Manage multiple listings
    A user can manage a profile (image, name, etc)
    A listing has One-many images
    A listing has one address
    A listing has one subleaser (one who posted listing)
    A user can message multiple users
    A profile can only have 1 pfp
    One address can have multiple posts (Multiple rooms per house or apt complex)

    The schema supports the user story by allowing listings to have consistent
    and predictable information as well as letting them create a listing.

    Can you double check these entities? What others entities can be included or that I am missing?

Prompt(New Chat):
    Can you make a ERD using Mermaid format with the following instructions {Assignment instructions}
    Below is the information I would like you to use
    Minimal ERD
        Entities
            User, Profile, Listing, Property, ListingImage, SavedListings
        Relationship mappings (what you’ll put on the ERD)
            User 1 → many Listing (posted_by)
            Property 1 → many Listing
            Listing 1 → many ListingImage
            User 1 → 1 Profile
            User many ↔ many Listing (SavedListing)
            User many ↔ many Listing (ListingView)
            User many ↔ many Listing (Inquiry)
    
Prompt: Do you think my professor will understand that, he knows I wont. I want to be honest and understand.

Prompt: Are there any other relationships that should be added?

Prompt:
    What are your thoughts on this explaination of my erdiagram on my user stories
    <h3>📚How ERD Supports User Stories</h3>
    This ERD
    - Allows 1 user to have exactly 1 profile
    - Allows 1 user to post many lisitngs
    - Allows properties to have multiple listings
    - Allows users to communicate a match

    The MVP for all user stories is having an application where they can create an account,
    a listing, and communicate with a buyer. This ERD allows the users to create
    accounts allowing lisitng privliages and buyer-seller communication.
```
---

<h2>📦Component Architecture</h2>
This section decompartmentalizes the property listing log using *Atomic Design Methodology* <br> <br>

***Atoms*** <br>
- Button
- Input
- Image
- Text
- icon
<br>

***Molecules*** <br>
- Search Bar
- Price display
- Location display
- Profile info display
<br>

***Organisms*** <br>
- Listing component/card
- Filter side bar
- Listing grid
- Infinite scroll trigger
<br>

***Templates*** <br>
- Lisitng catalog grid Template
- Listing catolog map Template
