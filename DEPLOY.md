# GAP 5C System — GitHub Codespaces Deployment

## One-Time Setup (takes ~10 minutes)

### Step 1 — Create the GitHub repo
1. Go to github.com and sign in
2. Click **+** → **New repository**
3. Name it: `gap-5c`
4. Set to **Public**, click **Create repository**

### Step 2 — Open GitHub Codespaces
1. On your new repo page, click the green **Code** button
2. Click **Codespaces** tab → **Create codespace on main**
3. Wait ~60 seconds for the terminal to open

### Step 3 — Set up the project
Paste these commands one at a time into the terminal:

```bash
npm create vite@latest . -- --template react --force
```
Press **y** if asked to confirm.

```bash
npm install
npm install recharts gh-pages
```

### Step 4 — Add your files
In the left file panel:
- Open the **`src`** folder
- Replace **`App.jsx`** with the contents of the App.jsx file you downloaded
- Replace **`main.jsx`** with the contents of main.jsx

In the **root** folder (not src):
- Replace **`package.json`** with the package.json you downloaded
- Replace **`vite.config.js`** with the vite.config.js you downloaded
- Replace **`index.html`** with the index.html you downloaded

### Step 5 — Update your username
Open `package.json` and replace `YOUR-GITHUB-USERNAME` with your actual GitHub username.

### Step 6 — Configure git and deploy
```bash
git config user.email "you@example.com"
git config user.name "Your Name"
git add .
git commit -m "Initial 5C system deploy"
git push
npm run deploy
```

### Step 7 — Enable GitHub Pages
1. Go to your repo → **Settings** → **Pages**
2. Under **Source**, select **gh-pages** branch → **Save**
3. Wait 2 minutes

### Your App URL
```
https://YOUR-GITHUB-USERNAME.github.io/gap-5c/
```
Bookmark this on every iPad and tablet on the floor.

---

## Updating the App Later
1. Open the Codespace (github.com → your repo → Code → Codespaces)
2. Edit App.jsx
3. Run: `npm run deploy`
4. Live in ~2 minutes ✓

---

## First Launch
- You'll be asked for your **Anthropic API key** (get one at console.anthropic.com)
- You can skip this and add it later in Setup
- Admin PIN is: **gap2026**
