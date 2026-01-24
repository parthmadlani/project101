# How to Host Root2Rise

Since your project has a **React Frontend** and a **Node.js/Express Backend** with a local database, hosting involves 3 parts:

1.  **Database** (Move from local file to Cloud)
2.  **Backend** (Host the API)
3.  **Frontend** (Host the Website)

---

## Step 1: Set up Cloud Database (Supabase)
The current app uses a local file (`database.sqlite`) which won't work well on cloud servers because the file gets deleted every time the server restarts.

1.  Go to [Supabase](https://supabase.com) and sign up.
2.  Create a "New Project".
3.  Once created, go to **Project Settings > API**.
4.  Copy the `URL` and `anon public` (or `service_role`) key. You will need these for Step 2.
    *   *Note: Your backend code is already compatible with Supabase! You just need to provide these credentials.*

---

## Step 2: Host the Backend (Render.com)
Render is great for Node.js apps.

1.  Push your code to **GitHub**.
2.  Go to [Render Dashboard](https://dashboard.render.com).
3.  Click **New +** -> **Web Service**.
4.  Connect your GitHub repository.
5.  **Settings**:
    *   **Root Directory**: `backend`
    *   **Build Command**: `npm install`
    *   **Start Command**: `node src/index.js`
6.  **Environment Variables** (Add these):
    *   `SUPABASE_URL`: (Paste from Step 1)
    *   `SUPABASE_SERVICE_ROLE_KEY`: (Paste from Step 1)
    *   `YOUTUBE_API_KEY`: (Your YouTube Key)
    *   `GEMINI_API_KEY`: (Your Gemini Key)
    *   `JWT_SECRET`: (Create a random secret password)
7.  Click **Create Web Service**.
8.  Once deployed, copy your **Backend URL** (e.g., `https://root2rise-backend.onrender.com`).

---

## Step 3: Host the Frontend (Vercel)
Vercel is the best place to host React apps.

1.  Go to [Vercel](https://vercel.com) and sign up.
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository.
4.  **Settings**:
    *   **Root Directory**: Click "Edit" and select `frontend`.
    *   **Build Command**: `npm run build` (Default)
    *   **Output Directory**: `build` (Default)
5.  **Environment Variables**:
    *   `REACT_APP_API_URL`: (Paste your **Render Backend URL** from Step 2)
        *   *Example:* `https://root2rise-backend.onrender.com` (do not add trailing slash `/`)
6.  Click **Deploy**.

---

## Summary
*   **Data** lives in Supabase (Cloud DB).
*   **Backend** runs on Render (API Logic).
*   **Frontend** runs on Vercel (User Interface).

Your app is now live and scalable! 🚀
