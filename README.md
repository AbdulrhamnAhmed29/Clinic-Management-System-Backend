# Clinic Queue Management API

A multi-tenant REST API for clinics to manage staff, service queues, and
customer tickets.

Built with **Node.js, Express 5, MongoDB, and Mongoose**.

## The Problem

Many clinics manage walk-in customers using paper lists, spreadsheets,
or disconnected tools. This makes it difficult to:

-   Keep customer queues organized.
-   Know which customer should be served next.
-   Give clinic staff a consistent view of queue activity.
-   Separate operational data between different clinics.
-   Control which actions each staff member is allowed to perform.

## The Solution

The Clinic Queue Management API provides a centralized backend for
multiple clinics.

Each clinic can manage its own staff, service queues, and customer
tickets. The API authenticates users, applies role-based access rules,
validates incoming data, and assigns sequential ticket numbers when
customers join a queue.

This repository contains the **backend API only**. A frontend
application is not included.

## Tech Stack

  Technology             Purpose
  ---------------------- -------------------------------
  Node.js (ES Modules)   JavaScript runtime
  Express 5              REST API framework
  MongoDB                Database
  Mongoose               Database modeling and queries
  Zod                    Request validation
  JWT                    Authentication
  bcrypt                 Password hashing
  dotenv                 Environment variables
  Nodemon                Development workflow

## Roles & Permissions

The API defines three user roles:

  Role             Responsibility
  ---------------- ---------------------------------------------------
  `super_admin`    Manages clinic tenants and system-level resources
  `clinic_admin`   Manages clinic operations and staff
  `employee`       Handles customer tickets and queue operations

Protected routes use authentication and role-authorization middleware.

-   `401 Unauthorized`: the request is unauthenticated or has invalid
    credentials.
-   `403 Forbidden`: the authenticated user does not have permission to
    perform the operation.

> **Tenant isolation matters:** role checks alone do not guarantee that
> users can only access data belonging to their clinic. Every
> tenant-scoped query must also enforce the authenticated user's tenant
> boundary.

## Core Features

-   Multi-tenant clinic management using a shared MongoDB database.
-   User registration and login.
-   JWT authentication using an HTTP-only cookie.
-   Bearer token authentication support.
-   Role-based route protection.
-   bcrypt password hashing.
-   Zod validation for incoming requests.
-   Clinic, user, and queue management.
-   Ticket creation with sequential numbers.
-   Pagination and filtering for list endpoints.

## Project Structure

The codebase uses a feature-based structure:

``` text
.
├── index.js
└── src/
    ├── auth/
    │   ├── controller/
    │   ├── middlewares/
    │   ├── validators/
    │   └── routes.js
    ├── config/
    │   └── db.js
    ├── features/
    │   ├── tenant/
    │   ├── users/
    │   ├── queues/
    │   └── tickets/
    └── middlewares/
        └── createMiddlewares.js
```

Each feature contains its own routes, controllers, models, and
validators. The tickets feature also contains a service for ticket
creation and number assignment.

## Important API Routes

Base URL:

``` text
http://localhost:3000/api
```

### Authentication --- `/auth`

  -----------------------------------------------------------------------
  Method            Endpoint          Access            Purpose
  ----------------- ----------------- ----------------- -----------------
  POST              `/register`       Public (current   Register a user
                                      implementation)   

  POST              `/login`          Public            Authenticate a
                                                        user

  POST              `/logout`         Public            Clear the
                                                        authentication
                                                        cookie
  -----------------------------------------------------------------------

Login request:

``` json
{
  "email": "staff@example.com",
  "password": "password123"
}
```

### Tenants --- `/tenant`

  Method   Endpoint   Access                    Purpose
  -------- ---------- ------------------------- -----------------
  POST     `/`        `super_admin`             Create a clinic
  GET      `/`        Intended: `super_admin`   List clinics
  GET      `/:id`     `super_admin`             Get a clinic
  PATCH    `/:id`     `super_admin`             Update a clinic
  DELETE   `/:id`     `super_admin`             Delete a clinic

Tenant listing supports cursor pagination through `limit` and `cursor`.

### Queues --- `/queues`

  Method   Endpoint   Access                     Purpose
  -------- ---------- -------------------------- --------------------
  GET      `/`        `clinic_admin`             List clinic queues
  POST     `/`        `clinic_admin`             Create a queue
  GET      `/:id`     Intended: `clinic_admin`   Get a queue
  PATCH    `/:id`     `clinic_admin`             Update a queue
  DELETE   `/:id`     Intended: `clinic_admin`   Delete a queue

Queue listing supports `page`, `limit`, and an optional `status` filter.

Available queue statuses:

-   `active`
-   `paused`
-   `closed`

The server assigns the authenticated user's ID and tenant ID when
creating a queue.

### Tickets --- `/ticket`

  Method   Endpoint   Access                       Purpose
  -------- ---------- ---------------------------- -----------------
  GET      `/`        `clinic_admin`, `employee`   List tickets
  GET      `/:id`     `clinic_admin`, `employee`   Get a ticket
  POST     `/`        `clinic_admin`, `employee`   Create a ticket

Ticket creation accepts the queue and customer details. The backend
increments the selected queue's ticket counter and stores the assigned
sequential number with the ticket.

Ticket listing supports optional `queueId`, `cursor`, and `limit`
parameters.

### Users --- `/users`

  Method   Endpoint   Access                          Purpose
  -------- ---------- ------------------------------- ---------------
  GET      `/`        Authenticated users             List users
  POST     `/`        `super_admin`, `clinic_admin`   Create a user
  GET      `/:id`     Authenticated users             Get a user
  PATCH    `/:id`     `super_admin`                   Update a user
  DELETE   `/:id`     `super_admin`, `clinic_admin`   Delete a user

User listing supports optional `role`, `page`, and `limit` parameters.
Passwords are hashed before storage and excluded from regular user
responses.

## Authentication & Frontend Integration

After successful login, the API returns a JWT in an HTTP-only cookie
named `token`.

For browser-based clients, include credentials in requests:

``` javascript
fetch("http://localhost:3000/api/users", {
  credentials: "include"
});
```

With Axios:

``` javascript
axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true
});
```

The API also accepts a JWT through the `Authorization` header:

``` http
Authorization: Bearer <token>
```

JWT expiration is currently set to one day. Logout clears the cookie,
but does not revoke an already-issued JWT used as a Bearer token.

> **CORS:** Cross-origin CORS configuration is not currently included.
> Configure CORS and compatible cookie settings before connecting a
> separately hosted frontend.

## Getting Started

### Requirements

-   Node.js and npm
-   MongoDB (local installation or MongoDB Atlas)

### Installation

``` bash
git clone <repository-url>
cd clinic-queue-management-api
npm install
```

Create a `.env` file in the project root:

``` env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/clinic-queues
JWT_SECRET=replace-with-a-long-random-secret
NODE_ENV=development
```

Start the development server:

``` bash
npm run dev
```

The API runs at:

``` text
http://localhost:3000
```

## Current Limitations

The following issues have been identified in the current implementation
and should be reviewed before production use:

-   The tenant listing route applies role authorization without first
    applying authentication middleware.
-   Queue GET-by-ID and DELETE role checks contain trailing spaces in
    their role arguments.
-   Queue listing references an undefined `createdBy` value when
    filtering by status.
-   The user-list validation schema does not declare the `cursor`
    parameter used by its controller.
-   Ticket cursor and limit handling need verification.
-   Public registration currently accepts `role` and `tenantId`; this
    should be restricted to prevent unauthorized privilege assignment.
-   Tenant isolation must be verified for every tenant-scoped read,
    update, and delete operation.
-   CORS is not currently configured.

These are known implementation issues, not guarantees that the affected
endpoints are production-ready.

## Project Scope

This project focuses on backend engineering concerns including REST API
design, authentication, authorization, request validation, data
modeling, multi-tenancy, and queue/ticket business logic.

The API is intended to serve as the backend foundation for clinic
administration dashboards, staff interfaces, and customer ticket
workflows.
