# How to Use FactOrNot

FactOrNot is a community-driven fact-checking platform where users submit claims and the community collectively verifies them as **Fact** or **Not**.

**Live App:** [https://factornotproject.onrender.com](https://factornotproject.onrender.com)

---

## Getting Started

### Creating an Account

1. Click **Register** in the top-right corner of the navigation bar.
2. Choose a username and password (minimum 4 characters).
3. Click **Register** — you will be automatically logged in.

### Demo Account

If you want to explore without creating an account:

- **Username:** `demo`
- **Password:** `demo`

### Logging In

1. Click **Login** in the top-right corner.
2. Enter your username and password.
3. Click **Login**.

---

## Browsing Claims

The **Claims Feed** is the homepage. Here you can:

- **Search** — Type keywords in the search bar and click **Search** to filter claims by title.
- **Filter by Channel** — Use the "All Channels" dropdown to view claims from a specific topic (e.g., Health, Politics, Technology).
- **Sort** — Choose between "Sort by Credibility" (most contested first) or "Sort by Newest."
- **Paginate** — Use the Previous/Next buttons at the bottom to navigate through pages of claims.

Click on any claim card to view its full details.

---

## Submitting a Claim

1. Log in to your account.
2. From the Claims Feed, click the **+ Submit Claim** button.
3. Fill in the form:
   - **Claim / Headline** (required) — The statement to be verified.
   - **Description** (optional) — Additional context about the claim.
   - **Source URL** (optional) — A link to where you found this claim.
   - **Channel** (required) — Select the topic category for this claim.
4. Click **Submit Claim**.

---

## Voting on Claims

1. Open any claim by clicking on it from the Claims Feed.
2. Click **Fact** if you believe the claim is true, or **Not** if you believe it is false.
3. Your vote updates the real-time **Credibility Meter** showing the community's consensus.
4. You can change your vote by clicking the other button, or remove your vote by clicking the same button again.

> **Note:** You must be logged in to vote.

### Understanding the Credibility Meter

- **Green (70–100%)** — "Likely Fact" — The community mostly agrees this is true.
- **Yellow (40–69%)** — "Contested" — The community is divided on this claim.
- **Red (0–39%)** — "Likely False" — The community mostly believes this is false.

The score is calculated as: `(Fact votes / Total votes) × 100`

---

## Adding Evidence

Evidence comments let you support or debunk a claim with reasoning and sources.

1. Open a claim's detail page.
2. Scroll down to the **Evidence & Comments** section.
3. Click **+ Add Evidence**.
4. Fill in the form:
   - **Your Analysis** (required) — Explain your reasoning.
   - **Source URL** (optional) — Link to a credible source supporting your position.
   - **Verdict** — Select whether your evidence "Supports the claim (Fact)" or "Debunks the claim (Not)."
5. Click **Submit Evidence**.

Evidence comments are color-coded:

- **Green border** — Supports the claim.
- **Red border** — Debunks the claim.

---

## Managing Your Claims

You can edit or delete claims you have submitted.

1. Open your claim's detail page.
2. At the bottom of the claim card, you will see **Edit Claim** and **Delete Claim** buttons (visible only to the claim author).
3. **Edit** — Update the title, description, or source URL.
4. **Delete** — Permanently remove the claim and all its data. You will be asked to confirm.

---

## Browsing Channels

Channels organize claims by topic (Politics, Health, Technology, Science, etc.).

1. Click **Channels** in the navigation bar.
2. Browse the channel cards showing name, description, category, and claim count.
3. Click any channel to view all claims within that topic.

---

## Creating a Channel

1. Log in to your account.
2. Go to the **Channels** page and click **+ Create Channel**.
3. Fill in the form:
   - **Channel Name** (required) — Must be unique.
   - **Description** (optional) — What kinds of claims belong here.
   - **Category** — Select from General, Politics, Health, Technology, Science, Finance, Entertainment, Sports, Education, Environment, or Lifestyle.
4. Click **Create Channel**.

---

## Managing Your Channels

You can edit or delete channels you have created.

1. Go to the **Channels** page.
2. Your channels will show **Edit** and **Delete** buttons.
3. **Edit** — Update the name, description, or category.
4. **Delete** — Permanently removes the channel **and all claims inside it**. You will be asked to confirm.

---

## Building Locally

### Prerequisites

- Node.js v18 or higher
- MongoDB (local installation or MongoDB Atlas account)

### Setup

```bash
# Install all dependencies
cd backend && npm install
cd ../frontend && npm install

# Seed the database with 1000+ sample records
cd ../backend
MONGO_URI="your-mongodb-connection-string" node seed.js

# Start the backend server (port 3001)
npm start

# In a new terminal, start the React dev server (port 3000)
cd frontend
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
cd frontend && npm run build
cd ../backend && npm start
```

The Express server serves the React build at [http://localhost:3001](http://localhost:3001).

---

## Tech Stack

- **Frontend:** React 18 with Hooks, PropTypes
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (native driver)
- **Authentication:** Passport.js (passport-local strategy), bcrypt, express-session
- **Session Store:** connect-mongo

---

## Authors

- **Kunal Takke** — Claims & Verification
- **Kunal Juvvala** — Topics & Channels

CS5610 Web Development — Professor John Alexis Guerra Gómez — Northeastern University
