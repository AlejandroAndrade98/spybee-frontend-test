# Spybee Frontend — Technical Test

Frontend application for the Spybee technical test.

The project recreates an incident management experience for construction projects, including an interactive map, incident creation flow, dashboard, advanced statistics, demo authentication, UI preferences and responsive design.

Stack: **Next.js App Router + React + TypeScript + Zustand + Mapbox GL + SCSS Modules**.

---

## ⚙️ Technologies and decisions

* **Next.js App Router**: route-based structure for `/login`, `/map`, `/dashboard` and `/options`.
* **React + TypeScript**: typed UI components and incident data models.
* **Zustand**: lightweight global state for incidents, authentication and UI preferences.
* **Mapbox GL**: interactive map, incident markers and location selection.
* **SCSS Modules**: scoped component styling without Tailwind.
* **CSS variables**: light/dark theme support.
* **Frontend-only demo auth**: protected routes and demo users without backend.
* **Remote-first data loading**: `/api/incidents` tries the remote JSON first and falls back to the local mock file.
* **Local persistence**: created incidents, auth session and preferences persist in the browser.
* **Docker**: optional production runtime for local review.
* **Vercel-ready**: the app can be deployed as a standard Next.js application.

---

## ✨ Features

### Authentication

The app includes demo authentication as an extra feature for the technical test.

Demo users:

| Email                  | Password  | Role       |
| ---------------------- | --------- | ---------- |
| `julian@spybee.com`    | `demo123` | Superadmin |
| `alejandro@spybee.com` | `demo123` | Admin      |
| `carol@spybee.com`     | `demo123` | Inspector  |

Notes:

* Authentication is frontend-only and intended only for the technical test.
* Sessions are persisted in localStorage using Zustand.
* `/map`, `/dashboard` and `/options` are protected routes.
* Existing mock incidents keep their original owners, assignees and observers.
* New incidents use the authenticated user as `owner`.

---

### Map

The map view includes:

* Interactive Mapbox GL map.
* Incident markers rendered from the provided mock data.
* Marker colors based on priority.
* Popup with incident details.
* Location picking mode for new incidents.
* Global `+` action from the sidebar that redirects to `/map` and starts incident creation.
* Newly created incidents appear on the map immediately.
* Locally created incidents persist after page reload.

Incident creation flow:

```txt
Click "+ Create incident"
        ↓
Select a point on the map
        ↓
Fill the incident form
        ↓
Attach evidence if needed
        ↓
Select assignees and observers
        ↓
Save incident
        ↓
New marker appears on the map
```

---

### Incident creation

The incident creation form supports:

* Title.
* Description.
* Due date.
* Category.
* Priority.
* Location description.
* Selected coordinates from the map.
* Tags based on available mock data.
* Assignees based on users from the mock data.
* Observers based on users from the mock data.
* Frontend-only attachments.

The generated incident keeps the same structure as the provided mock data, so it can be consumed by the map and dashboard without special handling.

---

### Attachments

The app includes frontend-only attachment support for created incidents.

Supported behavior:

* Select or drag small files in the creation modal.
* Preview images.
* Store serializable metadata in the created incident `media` array.
* Count created incidents with attachments as incidents with evidence in the dashboard.

Limitations:

* There is no real file upload because the project has no backend or storage service.
* Attachments are handled locally for demo purposes.
* In a production environment, files should be uploaded to a storage service such as S3, Supabase Storage or a backend-managed asset service.

---

### Dashboard

The dashboard provides a fast operational overview of project incidents.

It includes:

* KPI cards.
* Filters by search, project, status, priority, category and deleted records.
* Summary by status.
* Summary by priority.
* Summary by category.
* Summary by responsible person.
* Paginated incidents table.
* Advanced statistics view.

The dashboard has two modes:

```txt
Summary       → operational overview
Statistics    → deeper analysis and risk indicators
```

The statistics view includes:

* Trend and risk section.
* Detailed distribution.
* Tag insights.
* Team performance.
* Risk indicators.

No external charting library was added. Visualizations are built with React, computed data and SCSS Modules to keep the project lightweight.

---

### Options

The `/options` page centralizes UI preferences:

* Language switch: Spanish / English.
* Theme switch: light / dark.
* Placeholder cards for future product areas:

  * User administration.
  * Project configuration.
  * Reports and exports.

---

## 🗂️ Project structure

```txt
spybee-frontend-test/
├─ public/
│  ├─ assets/
│  │  └─ spybee_logo_light.png
│  └─ data/
│     └─ incidents.mock.json
│
├─ src/
│  ├─ app/
│  │  ├─ api/
│  │  │  └─ incidents/
│  │  │     └─ route.ts
│  │  ├─ dashboard/
│  │  ├─ login/
│  │  ├─ map/
│  │  ├─ options/
│  │  ├─ layout.tsx
│  │  └─ page.tsx
│  │
│  ├─ components/
│  │  ├─ auth/
│  │  ├─ dashboard/
│  │  ├─ layout/
│  │  ├─ map/
│  │  └─ options/
│  │
│  ├─ data/
│  ├─ i18n/
│  ├─ services/
│  ├─ store/
│  ├─ styles/
│  ├─ types/
│  └─ utils/
│
├─ Dockerfile
├─ .dockerignore
├─ next.config.ts
├─ package.json
└─ README.md
```

---

## 🧠 Data strategy

The app does not consume the signed mock URL directly from the browser.

Instead, the frontend calls:

```txt
/api/incidents
```

The internal Next.js route tries to load the remote JSON URL first:

```txt
INCIDENTS_REMOTE_URL
```

If the remote source is missing, expired or unavailable, the route falls back to:

```txt
public/data/incidents.mock.json
```

This keeps the app working even if the signed external URL stops responding.

---

## 🧩 State management

Zustand is used for three main areas.

### Incidents store

Handles:

* Base incidents loaded from `/api/incidents`.
* Locally created incidents.
* Selected incident.
* Creation modal state.
* Location-picking mode.
* Dashboard filters.

Only locally created incidents are persisted in localStorage.

### Auth store

Handles:

* Current demo user.
* Login.
* Logout.
* Session persistence.

Passwords are not stored in the auth store.

### Preferences store

Handles:

* Theme: light / dark.
* Language: ES / EN.
* UI preferences persistence.

---

## 🗺️ Mapbox implementation

Mapbox GL is initialized in a client component because it depends on browser APIs.

Important implementation details:

* The map component uses `"use client"`.
* `mapbox.Map`, markers and popups are stored in `useRef`.
* Zustand stores only application state, not Mapbox objects.
* Incident coordinates are converted from:

```ts
{
  lat: number;
  lng: number;
}
```

to the Mapbox expected format:

```ts
[lng, lat]
```

---

## 🚀 Getting started

### Requirements

* Node.js 20+
* npm
* Mapbox account/token

### 1. Clone the repository

```bash
git clone https://github.com/AlejandroAndrade98/spybee-frontend-test.git
cd spybee-frontend-test
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a local environment file:

```bash
cp .env.example .env.local
```

Then update:

```env
INCIDENTS_REMOTE_URL=
NEXT_PUBLIC_MAPBOX_TOKEN=
```

`NEXT_PUBLIC_MAPBOX_TOKEN` is required to render the map.

`INCIDENTS_REMOTE_URL` is optional. If it is not provided or fails, the app uses the local mock file.

### 4. Run development server

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

The home route redirects to `/login`.

---

## 🧪 Useful scripts

```bash
npm run dev
npm run lint
npm run build
npm start
```

---

## 🐳 Docker

Docker support is optional and provided as an alternative way to run the production build locally.

### Build image

Because `NEXT_PUBLIC_MAPBOX_TOKEN` is used by the browser bundle, it must be available at build time:

```bash
docker build --build-arg NEXT_PUBLIC_MAPBOX_TOKEN=YOUR_MAPBOX_TOKEN -t spybee-frontend-test .
```

### Run container

```bash
docker run -p 3000:3000 --env-file .env.local spybee-frontend-test
```

Open:

```txt
http://localhost:3000
```

### Notes

* No Docker Compose is included because the project has no database or additional services.
* The app uses a local JSON fallback if the remote incidents URL is unavailable.
* The container runs the Next.js production build.

---

## 🌐 Deployment

The app is ready to deploy on Vercel.

Required environment variables in Vercel:

```env
INCIDENTS_REMOTE_URL=
NEXT_PUBLIC_MAPBOX_TOKEN=
```

After deployment, validate:

```txt
/login
/map
/dashboard
/options
```

Deployment link: [Spybee Frontend Technical Test](https://spybee-frontend-test.vercel.app/login)


```

---

## ✅ Manual test checklist

### Auth

* Open `/map` without session → redirects to `/login`.
* Login with a demo user.
* Header shows authenticated user and role.
* Logout clears session.
* Refresh keeps the session.
* Opening `/login` with an active session redirects to `/map`.

### Map

* Map loads correctly.
* Markers appear.
* Marker popup opens on click.
* `+ Create incident` starts location-picking mode.
* Clicking the map opens the incident form.
* Saving creates a new marker.
* Refresh keeps locally created incidents.

### Incident creation

* New incident uses authenticated user as owner.
* Existing mock incidents keep their original owners.
* Assignees can be selected from mock users.
* Observers can be selected from mock users.
* Small image attachments can be added.
* Created incident includes `media`, `assignees` and `observers`.

### Dashboard

* KPIs render correctly.
* Filters work.
* Pagination works.
* Summary view works.
* Statistics view works.
* Locally created incidents are included.
* Incidents with attachments count as incidents with evidence.

### Options

* Theme switch works.
* Language switch works.
* Preferences persist after refresh.

### Docker

* Docker image builds successfully.
* Container runs on port `3000`.
* `/login`, `/map`, `/dashboard` and `/options` work inside the container.

---

## 🔒 About authentication

This project includes frontend-only demo authentication for the technical test.

It is not intended to be production authentication. A real product should use a backend session strategy, secure cookies, token validation, password hashing and role-based authorization on the server.

---

## 📎 About attachments

This project includes frontend-only attachment handling for the technical test.

It is not intended to replace production file storage. A real product should upload files to a secure storage service, validate files server-side, scan files when required and store only references in the incident record.

---

## 📌 Future improvements

If this project evolved into a production application, the next steps would be:

* Real backend persistence.
* Production authentication.
* Role-based permissions.
* Incident editing and status transitions.
* Production file storage for attachments.
* Marker clustering for dense map areas.
* Exportable reports.
* Audit trail for incident changes.
* Real-time collaboration.
* Automated tests.
