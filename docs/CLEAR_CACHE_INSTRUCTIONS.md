# How to Clear Cache and Data

## Option 1: Clear Browser Cache (Quick Fix)

### Chrome/Edge:
1. Press `F12` or right-click → "Inspect"
2. Go to **Application** tab
3. In the left sidebar, click **Local Storage**
4. Click on `http://localhost:3000`
5. Find and delete:
   - `safespace_current_user_id` (if you want to start fresh)
6. Refresh the page (F5)

### Firefox:
1. Press `F12` or right-click → "Inspect"
2. Go to **Storage** tab
3. Expand **Local Storage**
4. Click on `http://localhost:3000`
5. Delete the keys you want
6. Refresh the page

---

## Option 2: Clear All Local Storage (Complete Reset)

### In Browser Console:
1. Open DevTools (F12)
2. Go to **Console** tab
3. Type: `localStorage.clear()`
4. Press Enter
5. Refresh the page

---

## Option 3: Clear Convex Data (Remove Duplicate Messages)

### Using Convex Dashboard:
1. Go to https://dashboard.convex.dev
2. Select your project
3. Go to **Data** tab
4. Find the `messages` table
5. Delete duplicate welcome messages manually

### Or use Convex Functions:
We can create a cleanup function to remove duplicate messages.

---

## Option 4: Clear Everything (Nuclear Option)

1. Clear browser localStorage: `localStorage.clear()` in console
2. Clear Convex data via dashboard
3. Restart the dev server
4. Register/login again

