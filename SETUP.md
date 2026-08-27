# Amozzy Workouts

A dark, green-accented training calendar you can install as an app on your phone. No accounts, no server — everything you log lives in your browser's local storage on that device.

## What's in the app

- **Calendar (home page)** — opens straight to today. Each day shows colored dots for whatever muscle groups your active plan schedules that day. Tap any day to see (and log) that day's workout.
- **Settings → Exercises** — your exercise library, grouped by muscle group (Chest, Back, Shoulders, Biceps, Triceps, Quads, Hamstrings, Glutes, Calves, Core). Add, rename, or delete exercises. Comes pre-seeded with common lifts for each group.
- **Settings → Workout Plan** — build a plan: pick how many times per week you want to hit each muscle group, choose which exercises count for each, and set a duration in weeks. Creating a plan makes it "active" and generates the actual day-by-day calendar schedule, spreading sessions evenly across the week. You can keep multiple plans and switch which one is active.
- **Logging lifts** — on any day, each scheduled exercise has a weight × reps entry row. Add a set, see it appear as a pill (tap the × to remove it), and see your last-session numbers for that exercise for quick reference. You can also log an exercise that wasn't scheduled ("Log a lift") on any day, including rest days.
- **Settings → Data**:
  - Switch weight unit (lbs / kg).
  - **Export backup** — downloads a JSON file of everything (exercises, plans, logged lifts).
  - **Import backup** — restores from that JSON file. Use this to move data to a new device/browser, since nothing syncs automatically.
  - **Refresh app data** — clears the installed app's cached files and force-reloads the latest Vercel deployment. Use this if the app seems stuck on an old version after you ask for changes. It never touches your logged data.
  - **Clear all data** — wipes everything on this device (behind a confirmation step).

## How data works

There is no database and no login. Everything is stored in `localStorage` under the key `amozzy-workouts-data`, scoped to whatever browser/device you're using. That means:

- Data does **not** sync between your phone and laptop automatically.
- Clearing your browser's site data, or uninstalling the PWA in some browsers, deletes your logs.
- Use **Export backup** every so often, and **Import backup** on a new device to bring your history with you.

## Installing it as an app

Open the deployed URL on your phone:

- **iOS Safari**: Share → "Add to Home Screen."
- **Android Chrome**: menu → "Install app" (or you'll get an automatic install prompt).

It'll behave like a normal app: full-screen, its own icon, works offline for pages you've already visited.

## Making changes

This app was built and is maintained through conversation — just describe the change you want and it gets deployed straight to Vercel production. A few things worth knowing:

- The whole app is a single Next.js project (App Router, TypeScript, Tailwind). No backend, no environment variables, no database to configure.
- Deploys go straight to the `amozzy-workouts` Vercel project under your account.
- After a deploy, if the installed app doesn't show the update right away, use **Settings → Refresh app data**.

## Local development (optional)

If you ever want to run it on your own machine:

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Project structure

```
app/                   Pages (Calendar at "/", Settings at "/settings")
components/            Calendar, day panel, nav, settings sub-views
lib/                    Data model, the zustand store (localStorage-backed),
                        the plan/schedule generator, and history lookups
public/manifest.json    PWA manifest
public/icons/           App icons
public/sw.js            Service worker (network-first, offline fallback)
```
