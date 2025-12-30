# Shopify App Template - React Router

This is a template for building a [Shopify app](https://shopify.dev/docs/apps/getting-started) using [React Router](https://reactrouter.com/).  It was forked from the [Shopify Remix app template](https://github.com/Shopify/shopify-app-template-remix) and converted to React Router.

Rather than cloning this repo, follow the [Quick Start steps](https://github.com/Shopify/shopify-app-template-react-router#quick-start).

Visit the [`shopify.dev` documentation](https://shopify.dev/docs/api/shopify-app-react-router) for more details on the React Router app package.

## Upgrading from Remix

If you have an existing Remix app that you want to upgrade to React Router, please follow the [upgrade guide](https://github.com/Shopify/shopify-app-template-react-router/wiki/Upgrading-from-Remix).  Otherwise, please follow the quick start guide below.

## Quick start

### Prerequisites

Before you begin, you'll need the following:

1. **Node.js**: [Download and install](https://nodejs.org/en/download/) it if you haven't already.
2. **Shopify Partner Account**: [Create an account](https://partners.shopify.com/signup) if you don't have one.
3. **Test Store**: Set up either a [development store](https://help.shopify.com/en/partners/dashboard/development-stores#create-a-development-store) or a [Shopify Plus sandbox store](https://help.shopify.com/en/partners/dashboard/managing-stores/plus-sandbox-store) for testing your app.
4. **Shopify CLI**: [Download and install](https://shopify.dev/docs/apps/tools/cli/getting-started) it if you haven't already.
```shell
npm install -g @shopify/cli@latest
```

### Setup

```shell
shopify app init --template=https://github.com/Shopify/shopify-app-template-react-router
```

### Local Development

```shell
shopify app dev
```

Press P to open the URL to your app. Once you click install, you can start development.

Local development is powered by [the Shopify CLI](https://shopify.dev/docs/apps/tools/cli). It logs into your partners account, connects to an app, provides environment variables, updates remote config, creates a tunnel and provides commands to generate extensions.

### Authenticating and querying data

To authenticate and query data you can use the `shopify` const that is exported from `/app/shopify.server.js`:

```js
export async function loader({ request }) {
  const { admin } = await shopify.authenticate.admin(request);

  const response = await admin.graphql(`
    {
      products(first: 25) {
        nodes {
          title
          description
        }
      }
    }`);

  const {
    data: {
      products: { nodes },
    },
  } = await response.json();

  return nodes;
}
```

This template comes pre-configured with examples of:

1. Setting up your Shopify app in [/app/shopify.server.ts](https://github.com/Shopify/shopify-app-template-react-router/blob/main/app/shopify.server.ts)
2. Querying data using Graphql. Please see: [/app/routes/app.\_index.tsx](https://github.com/Shopify/shopify-app-template-react-router/blob/main/app/routes/app._index.tsx).
3. Responding to webhooks. Please see [/app/routes/webhooks.tsx](https://github.com/Shopify/shopify-app-template-react-router/blob/main/app/routes/webhooks.app.uninstalled.tsx).

Please read the [documentation for @shopify/shopify-app-react-router](https://shopify.dev/docs/api/shopify-app-react-router) to see what other API's are available.

## Shopify Dev MCP

This template is configured with the Shopify Dev MCP. This instructs [Cursor](https://cursor.com/), [GitHub Copilot](https://github.com/features/copilot) and [Claude Code](https://claude.com/product/claude-code) and [Google Gemini CLI](https://github.com/google-gemini/gemini-cli) to use the Shopify Dev MCP.  

For more information on the Shopify Dev MCP please read [the  documentation](https://shopify.dev/docs/apps/build/devmcp).

## Deployment

### Application Storage

This template uses [Prisma](https://www.prisma.io/) to store session data, by default using an [SQLite](https://www.sqlite.org/index.html) database.
The database is defined as a Prisma schema in `prisma/schema.prisma`.

This use of SQLite works in production if your app runs as a single instance.
The database that works best for you depends on the data your app needs and how it is queried.
Here’s a short list of databases providers that provide a free tier to get started:

| Database   | Type             | Hosters                                                                                                                                                                                                                               |
| ---------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MySQL      | SQL              | [Digital Ocean](https://www.digitalocean.com/products/managed-databases-mysql), [Planet Scale](https://planetscale.com/), [Amazon Aurora](https://aws.amazon.com/rds/aurora/), [Google Cloud SQL](https://cloud.google.com/sql/docs/mysql) |
| PostgreSQL | SQL              | [Digital Ocean](https://www.digitalocean.com/products/managed-databases-postgresql), [Amazon Aurora](https://aws.amazon.com/rds/aurora/), [Google Cloud SQL](https://cloud.google.com/sql/docs/postgres)                                   |
| Redis      | Key-value        | [Digital Ocean](https://www.digitalocean.com/products/managed-databases-redis), [Amazon MemoryDB](https://aws.amazon.com/memorydb/)                                                                                                        |
| MongoDB    | NoSQL / Document | [Digital Ocean](https://www.digitalocean.com/products/managed-databases-mongodb), [MongoDB Atlas](https://www.mongodb.com/atlas/database)                                                                                                  |

To use one of these, you can use a different [datasource provider](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#datasource) in your `schema.prisma` file, or a different [SessionStorage adapter package](https://github.com/Shopify/shopify-api-js/blob/main/packages/shopify-api/docs/guides/session-storage.md).

### Build

Build the app by running the command below with the package manager of your choice:

Using yarn:

```shell
yarn build
```

Using npm:

```shell
npm run build
```

Using pnpm:

```shell
pnpm run build
```

## Hosting

When you're ready to set up your app in production, you can follow [our deployment documentation](https://shopify.dev/docs/apps/deployment/web) to host your app on a cloud provider like [Heroku](https://www.heroku.com/) or [Fly.io](https://fly.io/).

When you reach the step for [setting up environment variables](https://shopify.dev/docs/apps/deployment/web#set-env-vars), you also need to set the variable `NODE_ENV=production`.


## Gotchas / Troubleshooting

### Database tables don't exist

If you get an error like:

```
The table `main.Session` does not exist in the current database.
```

Create the database for Prisma. Run the `setup` script in `package.json` using `npm`, `yarn` or `pnpm`.

### Navigating/redirecting breaks an embedded app

Embedded apps must maintain the user session, which can be tricky inside an iFrame. To avoid issues:

1. Use `Link` from `react-router` or `@shopify/polaris`. Do not use `<a>`.
2. Use `redirect` returned from `authenticate.admin`. Do not use `redirect` from `react-router`
3. Use `useSubmit` from `react-router`.

This only applies if your app is embedded, which it will be by default.

### Webhooks: shop-specific webhook subscriptions aren't updated

If you are registering webhooks in the `afterAuth` hook, using `shopify.registerWebhooks`, you may find that your subscriptions aren't being updated.  

Instead of using the `afterAuth` hook declare app-specific webhooks in the `shopify.app.toml` file.  This approach is easier since Shopify will automatically sync changes every time you run `deploy` (e.g: `npm run deploy`).  Please read these guides to understand more:

1. [app-specific vs shop-specific webhooks](https://shopify.dev/docs/apps/build/webhooks/subscribe#app-specific-subscriptions)
2. [Create a subscription tutorial](https://shopify.dev/docs/apps/build/webhooks/subscribe/get-started?deliveryMethod=https)

If you do need shop-specific webhooks, keep in mind that the package calls `afterAuth` in 2 scenarios:

- After installing the app
- When an access token expires

During normal development, the app won't need to re-authenticate most of the time, so shop-specific subscriptions aren't updated. To force your app to update the subscriptions, uninstall and reinstall the app. Revisiting the app will call the `afterAuth` hook.

### Webhooks: Admin created webhook failing HMAC validation

Webhooks subscriptions created in the [Shopify admin](https://help.shopify.com/en/manual/orders/notifications/webhooks) will fail HMAC validation. This is because the webhook payload is not signed with your app's secret key.  

The recommended solution is to use [app-specific webhooks](https://shopify.dev/docs/apps/build/webhooks/subscribe#app-specific-subscriptions) defined in your toml file instead.  Test your webhooks by triggering events manually in the Shopify admin(e.g. Updating the product title to trigger a `PRODUCTS_UPDATE`).

### Webhooks: Admin object undefined on webhook events triggered by the CLI

When you trigger a webhook event using the Shopify CLI, the `admin` object will be `undefined`. This is because the CLI triggers an event with a valid, but non-existent, shop. The `admin` object is only available when the webhook is triggered by a shop that has installed the app.  This is expected.

Webhooks triggered by the CLI are intended for initial experimentation testing of your webhook configuration. For more information on how to test your webhooks, see the [Shopify CLI documentation](https://shopify.dev/docs/apps/tools/cli/commands#webhook-trigger).

### Incorrect GraphQL Hints

By default the [graphql.vscode-graphql](https://marketplace.visualstudio.com/items?itemName=GraphQL.vscode-graphql) extension for will assume that GraphQL queries or mutations are for the [Shopify Admin API](https://shopify.dev/docs/api/admin). This is a sensible default, but it may not be true if:

1. You use another Shopify API such as the storefront API.
2. You use a third party GraphQL API.

If so, please update [.graphqlrc.ts](https://github.com/Shopify/shopify-app-template-react-router/blob/main/.graphqlrc.ts).

### Using Defer & await for streaming responses

By default the CLI uses a cloudflare tunnel. Unfortunately  cloudflare tunnels wait for the Response stream to finish, then sends one chunk.  This will not affect production.

To test [streaming using await](https://reactrouter.com/api/components/Await#await) during local development we recommend [localhost based development](https://shopify.dev/docs/apps/build/cli-for-apps/networking-options#localhost-based-development).

### "nbf" claim timestamp check failed

This is because a JWT token is expired.  If you  are consistently getting this error, it could be that the clock on your machine is not in sync with the server.  To fix this ensure you have enabled "Set time and date automatically" in the "Date and Time" settings on your computer.

### Using MongoDB and Prisma

If you choose to use MongoDB with Prisma, there are some gotchas in Prisma's MongoDB support to be aware of. Please see the [Prisma SessionStorage README](https://www.npmjs.com/package/@shopify/shopify-app-session-storage-prisma#mongodb).

## Resources

React Router:

- [React Router docs](https://reactrouter.com/home)

Shopify:

- [Intro to Shopify apps](https://shopify.dev/docs/apps/getting-started)
- [Shopify App React Router docs](https://shopify.dev/docs/api/shopify-app-react-router)
- [Shopify CLI](https://shopify.dev/docs/apps/tools/cli)
- [Shopify App Bridge](https://shopify.dev/docs/api/app-bridge-library).
- [Polaris Web Components](https://shopify.dev/docs/api/app-home/polaris-web-components).
- [App extensions](https://shopify.dev/docs/apps/app-extensions/list)
- [Shopify Functions](https://shopify.dev/docs/api/functions)

Internationalization:

- [Internationalizing your app](https://shopify.dev/docs/apps/best-practices/internationalization/getting-started)
# Product_Analyze
# Store Analysis Platform Documentation
## Project Overview
The **Store Analysis Platform** helps store owners understand what’s working in the market and improve their own stores using smart insights.

With this platform, a store owner can explore **top products from other stores**, filter them to see trends, and **compare them with their own products**. Based on this comparison, the system uses an **AI model from Hugging Face** to generate better **product titles and descriptions**, making listings more attractive and effective.

Along with product optimization, the platform also provides **SEO analysis** to help store owners understand how well their store is optimized for search engines and what can be improved.

Overall, this project is built to help store owners **make smarter decisions, improve product quality, and grow their online presence** with the help of AI and data.

---

## Features
- Analyze competitors’ top products
- Filter products by various performance metrics
- Add and manage your own store and products
- Compare your products with competitors’
- AI-powered suggestions for titles and descriptions
- SEO analysis and optimization suggestions
---

## 🏗 System Architecture
### 🎨 Frontend
**Responsibilities:**

- Provide an interactive UI for store owners
- Allow users to search and analyze competitor stores
- Display top products, filters, comparisons, AI suggestions, and SEO results
- Collect user inputs for store and product data
**Key Components:**

- Store search & analysis dashboard
- Product listing and filtering interface
- Product comparison view
- AI-generated title & description preview
- SEO analysis report view
---

### 🧠 Backend
**Responsibilities:**

- Handle business logic and API requests
- Fetch and process store and product data
- Perform product comparison logic
- Communicate with AI and SEO modules
- Manage authentication and data validation
**Key Components:**

- REST / API endpoints
- Store & product analysis services
- Comparison engine
- AI and SEO integration handlers
---

### 🤖 AI Integration
**When and how the AI model is used:**

- Triggered after product comparison is completed
- Uses competitor insights to improve the user’s product content
- Communicates with a Hugging Face AI model via API
**Output details:**

- Optimized product titles
- Improved product descriptions
- Content tailored for better visibility and engagement
---

### 🔍 SEO Analysis Module
**What it analyzes:**

- Store page content quality
- Keywords usage and relevance
- Metadata (titles, descriptions, structure)
- Overall SEO health of the store
**Output details:**

- SEO score or performance metrics
- Improvement suggestions
- Actionable insights for better search visibility
---

### 🗄 Database
**Stores:**

- User accounts
- Store details
- Product information
- Comparison results
- AI-generated content
- SEO analysis reports
**Data relationships:**

- One user → multiple stores
- One store → multiple products
- Products linked to comparison results
- AI outputs and SEO reports mapped to stores/products
---

## 🔄 Step-by-Step Flow
### i. **User Login**
- The user logs into the platform using secure authentication.
- Once authenticated, the system loads the user dashboard and previously saved stores (if any).
- The user is now ready to analyze, compare, or manage stores.
---

### ii. **Store Selection**
- The user can **search and analyze competitor stores**.
- The user can also **add their own store** by providing store details or URLs.
- Selected stores are saved for future comparisons and analysis.
---

### iii. **Product Analysis**
- The system fetches product data from the selected store.
- Top-performing products are identified based on available metrics.
- Users can **filter and sort products** to understand market trends and performance.
---

### iv. **Comparison**
- The user selects products from competitor stores and their own store.
- The system compares products based on key attributes such as titles, descriptions, and performance indicators.
- Comparison results highlight gaps and improvement opportunities.
---

### v. **AI Optimization**
- After comparison, the AI optimization feature is triggered.
- A **Hugging Face AI model** analyzes competitor data and user products.
- The AI generates **improved product titles and descriptions** tailored for better engagement and visibility.
---

### vi. **SEO Analysis**
- The user initiates SEO analysis for a selected store.
- The system evaluates content quality, keyword usage, and overall SEO health.
- SEO scores and actionable suggestions are generated to help improve search performance.
---

## 🔁 Data Flow Between Components
- **Frontend → Backend:**
 The frontend sends user actions and inputs (login requests, store URLs, product selections, filter options, comparison requests) to the backend through API calls.
- **Backend → AI Model:**
 After product comparison, the backend sends relevant product data and competitor insights to the Hugging Face AI model to generate optimized titles and descriptions.
- **Backend ↔ Database:**
 The backend stores and retrieves user data, store details, product information, comparison results, AI-generated content, and SEO analysis reports from the database.
- **Backend → SEO Module:**
 When SEO analysis is triggered, the backend passes store content and metadata to the SEO analysis module for evaluation and scoring.
- **Backend → Frontend:**
 The backend sends processed results back to the frontend, including analyzed products, comparison insights, AI-generated suggestions, and SEO reports, which are then displayed to the user.
---

## 🧭 User Journey
1. The store owner signs into the platform and lands on a clean dashboard designed for analysis and insights.
2. They start by searching for competitor stores or adding their own store to the system.
3. Once a store is selected, the platform displays top-performing products, allowing the user to filter and explore what is working well in the market.
4. The user then adds their own products and compares them side-by-side with competitor products to identify gaps and improvement areas.
5. After reviewing the comparison, the user triggers AI optimization, where the system generates improved product titles and descriptions using an AI model.
6. To further improve visibility, the user runs SEO analysis on their store and receives a clear SEO score along with actionable recommendations.
7. Finally, the user applies these insights to update their product listings and store content, helping them improve performance and grow their business
---

## 🔄 Logical Flow (Flowchart Style)
**Start**
 → User logs in
 → User selects or adds a store
 → Platform fetches competitor store data
 → User filters and analyzes top products
 → User compares competitor products with their own
 → AI generates improved product titles and descriptions
 → User reviews AI-generated suggestions
 → SEO analysis runs on the selected store
 → User receives SEO report and optimization suggestions
 → **End**

---

## 📝 Additional Notes
### 🎯 Intended Audience
- E-commerce store owners
- Online sellers and dropshippers
- Digital marketers and growth teams
- Small to medium business owners
---

### 💡 Use Cases
- Analyze competitor stores to identify top-performing products
- Improve product titles and descriptions using AI-generated suggestions
- Compare products to find content and SEO gaps
- Optimize store SEO for better search visibility
- Make data-driven decisions for product and store growth
---



---

### 🚀 Future Scope
- Advanced competitor tracking and trend prediction
- Multi-language AI content generation
- Performance analytics like conversion and engagement metrics
---

### 💰 Monetization Ideas
- Subscription-based access (Free / Pro / Enterprise)
- Pay-per-analysis or pay-per-AI-generation model
- Advanced SEO reports as a premium feature
- Store performance dashboards for enterprise users
- White-label solutions for agencies
## ⚠️ Limitations:
- Accuracy depends on the quality and availability of competitor store data
- Some stores may **fail to analyze** due to restricted access, dynamic content, or unsupported platforms
- AI-generated content may require manual review before publishing
- SEO analysis provides recommendations, not guaranteed ranking results
- Real-time competitor data may be limited by platform restrictions
---



