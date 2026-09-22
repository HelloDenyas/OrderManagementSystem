[English](README.md) | [Lietuvių](README.lt.md)

# Order Management System

## About

A web application for administrators to manage customers, products, and orders.
The interface is in Lithuanian and includes a dashboard with a summary of the system's data.

## Features

- Administrator login and logout.
- Customer creation, editing, deletion, and search.
- Product creation, editing, and deletion.
- Order creation for a customer with multiple products.
- Automatic order total calculation.
- Order statuses: Naujas, Vykdomas, Įvykdytas, and Atšauktas.
- Dashboard with customer, product, and order counts.
- Frontend and backend input validation.

## Tech stack

- ASP.NET Core / .NET 10
- Entity Framework Core
- PostgreSQL
- React + TypeScript
- Vite
- xUnit

## Architecture

The application follows this flow: React frontend → ASP.NET Core Web API → EF Core → PostgreSQL.
The main relationships are Customer → Orders → OrderItems → Products: a customer can have several orders, and each order contains items linked to products.

## Setup

All commands below are intended to be run in Windows PowerShell from the repository root unless another folder is explicitly mentioned.
The repository root is the main project folder that contains the `backend` and `frontend` folders.
Before starting, install the .NET 10 SDK, Node.js 22.12 or later with npm, and PostgreSQL.

### 1. Open the project folder

In File Explorer, open the folder containing `backend` and `frontend`.
Type `powershell` in the address bar and press Enter to open a terminal in this folder.
Copy one command at a time and press Enter. Wait for setup commands to finish before running the next one.

### 2. Create the PostgreSQL database

Make sure PostgreSQL is running. Use your PostgreSQL administration tool to create an empty database, for example `order_management_db`.
If you use pgAdmin, connect to your server, right-click **Databases**, choose **Create → Database**, enter the name, and click **Save**.
Keep the database name, server address, port, username, and password ready for the next step.

### 3. Configure the database connection

In PowerShell, replace each `<...>` placeholder, including the angle brackets, with your PostgreSQL values. Keep the surrounding quotes.
Use your own PostgreSQL port. This command saves the connection settings in .NET User Secrets.

```powershell
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=<host>;Port=<port>;Database=<database>;Username=<username>;Password=<database-password>" --project backend/OrderManagement.Api
```

### 4. Configure the administrator

Choose your login username and replace `<your-password>` with your own password. The example username is `admin`.

```powershell
dotnet user-secrets set "Admin:Username" "admin" --project backend/OrderManagement.Api
dotnet user-secrets set "Admin:Password" "<your-password>" --project backend/OrderManagement.Api
```

The account is created when the API starts if no administrator exists. These settings do not overwrite an existing account.

### 5. Restore tools and dependencies

Run both commands from the repository root and wait for them to finish:

```powershell
dotnet tool restore --tool-manifest dotnet-tools.json
dotnet restore backend/OrderManagement.Api/OrderManagement.Api.csproj
```

### 6. Apply migrations

Create the application's tables in the database configured in step 3:

```powershell
dotnet ef database update --project backend/OrderManagement.Api --startup-project backend/OrderManagement.Api -- --environment Development
```

### 7. Run the backend

```powershell
dotnet run --project backend/OrderManagement.Api --launch-profile http
```

Wait until the terminal shows that the API is listening at `http://localhost:5212`.
Keep this terminal open. The API runs in Development mode and loads your User Secrets.

### 8. Run the frontend

Open a second PowerShell terminal in the repository root, as in step 1.
The first command below moves into `frontend`; run the remaining commands there:

```powershell
cd frontend
npm install
npm run dev
```

Keep this terminal open too. Vite forwards the frontend's `/api` requests to `http://localhost:5212`.

### 9. Open the application and log in

Open the local URL printed by Vite in your browser.
Log in with the administrator username and password from step 4.

### 10. Optional: run tests

Stop the backend by pressing `Ctrl+C` in its terminal, then run the command in **Tests** below from the repository root.
To check the frontend, stop it with `Ctrl+C` in its terminal, then run `npm run lint` or `npm run build` from `frontend/`.

## Tests

Run from the repository root:

```powershell
dotnet test backend/OrderManagement.Api.Tests/OrderManagement.Api.Tests.csproj
```

Tests cover validation, authentication, products, and orders. Integration tests use SQLite in-memory.

## Notes

- Order totals are calculated by the backend.
- Stock is validated when creating orders but is not automatically deducted.
- Secrets should not be committed to the repository.
