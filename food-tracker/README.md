# Plate — setup guide

A private calorie and macro tracker: log food against your own database, watch a
daily calorie/macro summary, track water and weight, and optionally sync it all
across your phone and other devices through your own Google Drive. No account,
no backend server, no build step.

This lives in the `food-tracker/` folder of this repo, alongside `Daily Card`
(a separate app in the repo root) — the two don't share data or code.

## What's in this folder

| File | What it's for |
|---|---|
| `index.html` | The whole app — markup, styles, and logic in one file |
| `manifest.webmanifest` | Lets phones install it as an app |
| `sw.js` | Service worker, so it opens offline |
| `icon-*.png`, `apple-touch-icon.png` | Home screen icons |

Keep all of these in the same folder. Nothing here needs a build step, a
server, or an account — just static files.

---

## Step 1 — Put it online

Any static host works, and this folder can be deployed on its own (point the
host at `food-tracker/` as the site root, or deploy the whole repo and visit
`/food-tracker/`). All of these are free and give you HTTPS, which the app
needs for offline mode and Drive sync.

### Option A — Netlify Drop (fastest, no account needed to start)

1. Go to **app.netlify.com/drop**.
2. Drag the `food-tracker` folder onto the page (drag the folder's contents
   if the tool doesn't like a nested folder — `index.html` must end up at the
   site's root).
3. You get a URL like `https://calm-otter-1a2b3c.netlify.app` in about ten
   seconds.
4. Sign up (free) to claim the site so it doesn't disappear, and rename it
   under **Site configuration → Change site name**.

### Option B — Cloudflare Pages

1. Sign in at **dash.cloudflare.com** → **Workers & Pages** → **Create** →
   **Pages** → **Upload assets**.
2. Name the project, drag the folder's contents in, deploy.
3. You get `https://your-project.pages.dev`.

Worth it if you want the access-control option described below.

### Option C — GitHub Pages

Best if you want version history and the ability to edit the file in the
browser.

1. In this repo: **Settings → Pages → Source: Deploy from a branch**, pick
   the branch, and set the folder to `/food-tracker` if that option is
   available, or `/ (root)` and then visit `/food-tracker/` on the published
   site.
2. After a minute you're live at
   `https://yourname.github.io/repo-name/food-tracker/`.

Note that GitHub Pages sites are publicly readable, and serving from a
private repo needs a paid plan.

### How private is this really?

The **URL is public** — anyone who knows or guesses it can load the page.
But **your data isn't in the page.** It lives in your browser's storage on
your own device, and in your own Drive if you turn on sync. A stranger who
finds the URL sees an empty tracker with sample goals, and learns nothing
about you.

If that still bothers you, put a login in front of it: deploy on
**Cloudflare Pages**, then in **Zero Trust → Access → Applications**, add a
self-hosted application pointing at your Pages domain with a policy that
allows only your email address. Free for up to 50 users, and it emails you a
one-time code to get in.

---

## Step 2 — Get it on your phone

Open your new URL on the phone, then install it. Installing matters for more
than looks: an installed app gets a proper icon, opens without browser
chrome, works offline, and — importantly on iPhone — is exempt from Safari's
habit of clearing website storage after a week of not visiting.

**iPhone / iPad (Safari):** tap the Share button → **Add to Home Screen** →
**Add**. It must be Safari; Chrome on iOS can't install web apps.

**Android (Chrome):** tap the ⋮ menu → **Add to Home screen** / **Install
app**. Chrome often prompts on its own after a visit or two.

**Desktop (Chrome/Edge):** an install icon appears at the right of the
address bar.

---

## Step 3 — Backups

Open the **Data** tab.

**Download backup** saves everything — foods, every diary entry, weights —
as one JSON file named with today's date. Put it in Drive, iCloud, Dropbox,
wherever. It's plain text you can read and repair by hand if it ever comes
to that.

**Restore from file** reads one of those files back in. It *merges* rather
than replaces: foods and diary entries from the file are added to what's
already there, so restoring an old backup can't wipe out newer entries. If
you want a genuinely clean start, use **Erase all data on this device**
first, then restore.

Do this manually every so often even if you set up sync below. Sync protects
against losing a device; a backup file protects against a bad sync, a
mistaken deletion, or Google locking you out.

---

## Step 4 — Sync across devices with your Drive

This is optional and takes about ten minutes, once. The app stores a single
file in Drive's **app data folder** — a hidden area scoped to just this app.
It's invisible in your normal Drive view, other apps can't touch it, and
Google can't index it. It also doesn't count against anything you'd notice;
the file is a few kilobytes.

You need a Google API client ID, which means creating a throwaway Google
Cloud project. It's free and you're the only user.

### Create the client ID

1. Go to **console.cloud.google.com** and create a new project — call it
   *Plate*.
2. **APIs & Services → Library**, search for **Google Drive API**, and
   enable it.
3. Go to the **OAuth consent screen** (in newer consoles this lives under
   **Google Auth Platform**). Choose **External**, give the app a name and
   your email, and save. When it asks about **Audience**, leave the
   publishing status as **Testing**, and add your own Google account under
   **Test users**. Because you're only ever going to be your own user, you
   never need Google's app verification.
4. Go to **Credentials → Create credentials → OAuth client ID**. Application
   type: **Web application**.
5. Under **Authorized JavaScript origins**, add your site's origin exactly:
   - `https://your-site.netlify.app` — scheme included, **no trailing
     slash, no path** (if your app lives at a sub-path like
     `/food-tracker/`, the origin is still just the scheme + host, no path)
   - optionally `http://localhost:8000` if you want to test locally
6. Create it and copy the **Client ID** — it ends in
   `.apps.googleusercontent.com`.

The client ID isn't a secret. It identifies your app, not you, and it's
designed to be visible in browser code.

### Connect

1. Open the app → **Data** tab.
2. Paste the client ID and tap **Connect**.
3. Sign in and approve. Google will warn you the app isn't verified — that's
   expected for a personal app in Testing mode. Continue past it.
4. The status line turns green-dotted with a timestamp. On every other
   device, open the same URL and paste the same client ID.

After that, **Sync automatically** pushes your data up a few seconds after
you edit anything, and pulls on launch and whenever you come back to the app
after a while. **Sync now** (the same Connect button, once linked) forces
it.

### What happens when two devices disagree

Nothing gets thrown away. Foods, diary entries, and weight logs from both
sides are combined by whichever copy of each item was edited most recently.
Deleting something on one device and syncing removes it everywhere, even if
the other device edited it earlier — deletes always win over older edits.
Your calorie/macro goals come wholesale from whichever device edited them
most recently, which is the one case where a same-time edit on two devices
could lose one side's change.

---

## Editing it later

It's one HTML file with no dependencies, so you can open `index.html` in any
text editor and change it. Colors are the CSS variables at the top of the
`<style>` block (`--bg`, `--accent`, `--ink`, and the macro colors
`--protein` / `--carbs` / `--fat`). Meal names and emoji are the `MEALS`
array near the top of the script.

To preview changes locally, don't open the file directly — `file://` blocks
service workers and the manifest. Run this in the `food-tracker` folder
instead:

```
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

When you redeploy, bump `const V = 'plate-v1'` in `sw.js` to `v2`, `v3`, and
so on. The service worker serves the cached copy until that version string
changes, so without it your phone may keep showing the old version.

---

## If something goes wrong

**Phone still shows the old version.** Bump the cache version in `sw.js` as
above and redeploy. Failing that, delete the home screen icon and
re-install.

**"Error 400: redirect_uri_mismatch" or "origin mismatch".** The origin in
your Google credentials doesn't exactly match the URL bar. Check for a
trailing slash, `http` vs `https`, or a `www.` that's present in one and not
the other. Remember the origin is scheme + host only — never include
`/food-tracker/` in it.

**Sign-in popup opens and closes with nothing happening.** Usually a popup
blocker, or Safari's cross-site tracking prevention. Allow popups for your
site and try again.

**Sync says it expired.** Access tokens are short-lived and renew silently
while you're signed in to Google. Tap **Connect** again to re-authorize.

**Everything vanished.** Restore your most recent backup file from the
**Data** tab. If sync was on, opening the app on another signed-in device
and tapping **Connect** (now labeled **Sync now**) will pull the Drive copy
back down.
