# 🚀 Step-by-Step Hosting Guide for Root2Rise

Follow this guide exactly to get your application live on the internet!

---

## **Part 1: Upload Code to GitHub**
*If you already have this on GitHub, skip to Part 2.*

1.  Log in to [GitHub.com](https://github.com) and create a **New Repository**.
    *   Name it `root2rise-app`.
    *   Make it **Public**.
    *   Click **Create repository**.

2.  Open your **Terminal** (in the project folder) and run these commands one by one:
    ```bash
    git init
    git add .
    git commit -m "Initial commit for production"
    git branch -M main
    git remote add origin https://github.com/YOUR_USERNAME/root2rise-app.git
    git push -u origin main
    ```
    *(Replace `YOUR_USERNAME` with your actual GitHub username found in the URL you just created).*

---

## **Part 2: Deploy Backend (The API)**
We will use **Render** to host the server for free.

1.  Go to [dashboard.render.com](https://dashboard.render.com/) and Sign Up/Login (use GitHub).
2.  Click **New +** button → Select **Web Service**.
3.  Select **"Build and deploy from a Git repository"**.
4.  Find your `root2rise-app` repo and click **Connect**.
5.  **Configure these settings EXACTLY:**
    *   **Name:** `root2rise-backend`
    *   **Root Directory:** `backend` (⚠️ Very Important!)
    *   **Environment:** Node
    *   **Build Command:** `npm install`
    *   **Start Command:** `node src/index.js`
    *   **Plan:** Free
6.  Click **Create Web Service**.
7.  Wait for it to build (might take 2-3 minutes).
8.  Once done, look at the top left for your URL.
    *   It will look like: `https://root2rise-backend.onrender.com`.
    *   **Copy this URL**, you need it for the next step!

---

## **Part 3: Deploy Frontend (The Website)**
We will use **Vercel** to host the React interface.

1.  Go to [vercel.com](https://vercel.com/) and Sign Up/Login (use GitHub).
2.  Click **Add New...** → **Project**.
3.  Find your `root2rise-app` repo and click **Import**.
4.  **Configure Project:**
    *   **Framework Preset:** Create React App (should auto-detect).
    *   **Root Directory:** Click **Edit** and select the `frontend` folder. (⚠️ Crucial!).
5.  **Environment Variables:**
    *   Expand `Environment Variables`.
    *   **Key:** `REACT_APP_API_URL`
    *   **Value:** Paste your Render Backend URL (from Part 2) **without** the trailing slash.
        *   Calculated Example: `https://root2rise-backend.onrender.com`
6.  Click **Deploy**.

---

## **Part 4: Final Success!**
1.  Vercel will give you a domain (e.g., `root2rise-app.vercel.app`).
2.  Click it to visit your live site!
3.  Try logging in and using the app.

### **⚠️ Important Note on Data:**
Since we are using the **Free Tier** for hosting:
1.  **Speed:** The backend (Render) will "sleep" after 15 minutes of inactivity. The first time you load the site, it might take **30-50 seconds** to wake up. This is normal for free hosting.
2.  **Data Persistence:** On the free tier, Render might **reset your database** (videos watched, certificates) every time you deploy or if the server restarts. For a demo/portfolio, this is fine. For a real business, you would need a paid database (like postgres).

**Enjoy your live Root2Rise app! 🚀**
