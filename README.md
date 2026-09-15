# Azure Container Apps for Azure AI Search

This code sample builds a web site on Azure to search through a catalog of books. Searchable content is indexed and queried on Azure AI Search, and the app runs on Azure Container Apps.

This sample includes a C# bulk-insert app, a C# Azure Functions API, and a React/Node.js web client.

| Component | Description |
|---------|-------------|
| bulk-insert app | Creates and loads the "good-books" index on Azure AI Search. It demonstrates index creation and batch mode indexing. Sample data is loaded from the [azure-search-sample-data](https://github.com/Azure-Samples/azure-search-sample-data/tree/main/good-books) repository.|
| client app | Provides the client code. The web front-end includes a search page with faceted navigation, a search bar for free form search and suggested queries, and tabbed page results. It's written in JavaScript, uses Node.js for the runtime, and uses React libraries for user interaction. |
| api | Provides the Azure Functions app used by the client to send queries to the search index. |

This README is a shortened version of the [full tutorial](https://aka.ms/search-website-tutorial) and provides just the steps for running the sample. For more information and screenshots, see the tutorial.

## Prerequisites

* An active Azure subscription
* [Azure Developer CLI](https://aka.ms/azd)
* [Docker](https://docs.docker.com/get-docker/)
* [.NET 9](https://dotnet.microsoft.com/download/dotnet/9.0)
* [Node.js 18.x LTS or later](https://nodejs.org/en/download/package-manager)
* [Git](https://git-scm.com/downloads)

Because deployment assigns Azure roles automatically, the deploying user needs permission to create role assignments on the target resource group — the **Owner** or **User Access Administrator** role (which grants `Microsoft.Authorization/roleAssignments/write`). Without it, `azd up` fails when it provisions the role assignments.

You don't need to hold any Azure AI Search data-plane roles in advance. During provisioning, `main.bicep` assigns **Search Index Data Contributor** and **Search Service Contributor** to both the app's managed identity (for keyless query access) and the deploying user (so the `postprovision` `bulk-insert` hook can create and populate the index).

For local development of the API or client:

* [Visual Studio Code](https://code.visualstudio.com/Download)
* [Azure Functions Core Tools](https://learn.microsoft.com/azure/azure-functions/functions-run-local)
* [Using .NET in Visual Studio Code](https://code.visualstudio.com/docs/languages/dotnet)

## Run the live API and browser tests locally

The Playwright suites run the API and browser layers separately against a
provisioned Azure AI Search service. They don't create, update, or seed Azure
resources. Before running them, verify that:

* Azure AI Search is provisioned and the `good-books` index is seeded.
* The signed-in Azure identity can read index data.
* .NET 9, Azure Functions Core Tools, Node.js 18 or later, and npm are
  installed.
* `SearchServiceName` and `SearchIndexName` are set for the local API. Keep
  credentials in the local Azure CLI, Azure Developer CLI, or environment
  configuration; don't add them to source files.

Install and build the dependencies:

```powershell
dotnet restore .\azure-search-static-web-app.sln
dotnet build .\api\azure-search-function.csproj -c Release --no-restore
Push-Location .\client
npm ci
npx playwright install chromium
npm run build
Pop-Location
```

Start the API and client in separate terminals:

```powershell
# Terminal 1
$env:SearchServiceName = '<existing-search-service>'
$env:SearchIndexName = 'good-books'
Set-Location .\api
func start --port 7071

# Terminal 2
$env:VITE_REACT_APP_BACKEND_URL = 'http://127.0.0.1:7071'
Set-Location .\client
npm run dev -- --port 3000
```

Run the suites with configurable URLs:

```powershell
Push-Location .\client
$env:PLAYWRIGHT_API_URL = 'http://127.0.0.1:7071'
$env:PLAYWRIGHT_CLIENT_URL = 'http://127.0.0.1:3000'
npm run test:api
npm run test:e2e
npm run test:visual
npm run test:structure
npm run test:all
Pop-Location
```

The API suite first verifies the canonical 10,000-document dataset and stable
book ID 9734. If that preflight fails, use the intended seeded environment
rather than weakening the fixture. The native browser suite doesn't intercept,
mock, or rewrite API responses. Controlled-network tests live in separate spec
files and cover request counts, delayed out-of-order responses, loading,
failure, missing-image, and long-content states without changing the live API
contract tests.

The browser coverage includes semantic-role interactions, keyboard operation,
axe checks, and overflow checks at 320, 390, 768, and 1440 pixels. The API
contract suite remains a separate Playwright project so a UI fixture can't
hide a backend regression.

### Visual and design-system validation

`npm run test:visual` compares the principal current-UI states with the
explicitly reviewed PNG files under
`client/tests/visual/__screenshots__/current/`. Update them only after
inspecting every changed image:

```powershell
Push-Location .\client
npm run test:visual -- --update-snapshots
git diff -- tests\visual\__screenshots__\current
Pop-Location
```

The design-system integration uses an intentionally separate baseline and
structure mode:

```powershell
Push-Location .\client
npm run test:structure:design
npm run test:design
# Only after reviewing the combined UI:
npm run test:design -- --update-snapshots
git diff -- tests\visual\__screenshots__\design
Pop-Location
```

Don't copy the current baseline into the design directory or accept snapshots
solely to make a test pass. A reviewer must compare the combined UI with the
approved source theme and inspect home, suggestions, results, combined facets,
pagination, details, Raw Data, mobile navigation, and no-results states.

`client/design-system.policy.json` is the maintainable migration policy. In
design mode, the structure gate requires TypeScript source, `ThemeProvider`,
`CssBaseline`, retained Playwright scripts, no Bootstrap/jQuery/Popper
dependencies or classes, no superseded JSX/CSS implementations, and no raw
colors or CSS lengths outside `src/theme.ts`. Relative layout values such as
percentages and MUI numeric spacing remain valid; new visual constants belong
in the theme rather than a component-level allowlist.

The manual **Live Azure AI Search tests** workflow uses the protected
`live-search-tests` environment. Configure its `AZURE_CLIENT_ID`,
`AZURE_TENANT_ID`, and `AZURE_SUBSCRIPTION_ID` variables for federated Azure
login, then provide the existing search service, index, client URL, and API URL
when dispatching the workflow.

## Download sample repository

1. In a terminal, use git to clone this repository to your local computer:

    ```bash
    git clone https://github.com/Azure-Samples/azure-search-static-web-app
    ```

1. Open that local directory in Visual Studio Code.

## Deploy with the Azure Developer CLI (azd)

```bash
azd auth login
azd up
```

This provisions all Azure resources (Azure AI Search, Container Apps, Container Registry) and deploys both containers. The default uses **keyless (managed identity) authentication** — no code changes required.

The `postprovision` hook automatically runs `bulk-insert` to create and populate the `good-books` search index after infrastructure is provisioned.

**Key environment variables** (set automatically by azd from `infra/main.bicepparam`):

| Variable | Description |
|---|---|
| `SEARCH_SERVICE_NAME` | Name of the Azure AI Search service (bicep output, used by seed hook) |
| `SEARCH_INDEX_NAME` | Search index name (default: `good-books`) |

### Authentication

By default, the search service is configured with **keyless (managed identity) authentication** — `disableLocalAuth: true` is set on the search service, and the user-assigned managed identity receives Search data-plane role assignments. The server container app receives `AZURE_CLIENT_ID` and authenticates via `DefaultAzureCredential`. No code changes required.

**Optional API key auth** can be enabled by setting `USE_KEYLESS_AUTH` to false:

```bash
azd env set USE_KEYLESS_AUTH false
azd up
```

When `USE_KEYLESS_AUTH=false`, the infra provisions the admin key as a container secret and sets `SEARCH_USE_KEY_AUTH=true` on the server container, which causes `api/SearchClientFactory.cs` to use `AzureKeyCredential` instead of `DefaultAzureCredential`.

#### Keyless Authentication Configuration (Two Environment Variables)

The keyless authentication setup uses **two distinct environment variables** for different purposes and times:

1. **Infrastructure Provisioning Time: `useKeylessAuth` (Bicep parameter)**
   - **When:** `azd up` executes the Bicep template (`infra/main.bicep`)
   - **Purpose:** Determines whether the Azure AI Search service disables local auth and enables role-based access control (RBAC)
   - **Values:** `true` (default) or `false`
   - **Effect:**
     - `true`: Sets `disableLocalAuth: true` on the search service, requiring keyless auth; assigns Search RBAC roles to the managed identity
     - `false`: Allows API key auth; provisions and injects the admin key as a container secret
   - **Set via:** `azure.yaml` hooks or `azd env set` / `azd config` during provisioning
   
2. **Runtime: `SEARCH_USE_KEY_AUTH` (Application Environment Variable)**
   - **When:** Application containers start (server and bulk-insert)
   - **Purpose:** Switches the search credential strategy at runtime (keyless vs API key)
   - **Values:** `true` (use API key) or unset/`false` (use keyless/DefaultAzureCredential)
   - **Effect:**
     - `SearchClientFactory.cs` reads this variable and selects the credential type
     - When `true`: Uses `AzureKeyCredential` with the injected key
     - When `false`/unset: Uses `DefaultAzureCredential` with the managed identity identified by `AZURE_CLIENT_ID`
   - **Set via:** Bicep container app environment config

3. **Managed Identity Identifier: `AZURE_CLIENT_ID` (Infrastructure Provisioning Time)**
   - **When:** `azd up` sets this on the server container app (only when `useKeylessAuth=true`)
   - **Purpose:** Identifies which managed identity `DefaultAzureCredential` should use when multiple identities exist on the host
   - **Value:** The user-assigned managed identity's client ID
   - **Usage:** `api/SearchClientFactory.cs` passes this to `DefaultAzureCredential.CreateAsync()` via `new ManagedIdentityClientId(clientId)`

#### Azure AI Search Keys: Admin vs Query Keys

Azure AI Search provides **two types of keys** for different security contexts:

| Key Type | Purpose | Permissions | Scope | When to Use |
|----------|---------|-------------|-------|------------|
| **Admin Key** | Index and service management | Full: create/delete indexes, manage synonyms, configure analyzers, add/update/delete documents | All operations (data plane + admin) | Index creation, schema changes, bulk data loading (administrative) |
| **Query Key** | Data queries only | Read-only: execute search queries, retrieve documents | Data-plane queries only | Client-facing search API, public search interfaces, query operations |

**Best Practice:** Use separate keys for their intended purposes:
- **Bulk-insert (index creation):** Use the **admin key** (required for `CreateOrUpdateIndexAsync`)
- **Search API (queries):** Use a **query key** (principle of least privilege)

**Current Implementation:** This solution uses the **admin key for both** bulk-insert and search queries when key auth is enabled. This is a **security anti-pattern** — the query-facing API has more permissions than necessary. To improve security:
- Fetch the **query key** instead of the admin key in the `azure.yaml` postprovision hook (use `az search query-key list` and select the first key)
- Pass it to the server container as `SEARCH_QUERY_KEY` instead of `SEARCH_API_KEY`
- Update `api/SearchClientFactory.cs` to use `SEARCH_QUERY_KEY` for search operations

> **How the credential is selected:** The search API (`api/SearchClientFactory.cs`) reads the `SEARCH_USE_KEY_AUTH` environment variable at runtime. When it is `true`, `AzureKeyCredential` is used with the injected key; otherwise `DefaultAzureCredential` is used (keyless default). The same logic applies to the `bulk-insert` seed hook. No code changes needed to switch modes.

> [!NOTE]
> **Why these deployment files**
> - **Client runtime config (`docker-entrypoint.sh` + `/config.js` + `url-fetch.js`)**: Vite bakes `VITE_*` env at BUILD time, but the backend's Container Apps FQDN isn't known until provisioning; the client reads the backend URL at container start via an injected `/config.js` (`window.__APP_CONFIG__`). Deployment wiring, not app logic.
> - **bulk-insert azd seed hook**: the sample needs a populated search index to function; wiring `bulk-insert` as an `azd` postprovision hook (reading connection info from the provisioned resources via env) auto-seeds the index on `azd up` instead of manually editing placeholder constants.

To redeploy after code changes: `azd deploy`

## Browse the deployed app

After `azd up` completes, the CLI prints the URL for the client Container App. Open that URL in your browser, enter a search query such as `code`, and review the results.