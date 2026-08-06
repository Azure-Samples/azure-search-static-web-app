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

> **How the credential is selected:** The search API (`api/SearchClientFactory.cs`) reads the `SEARCH_USE_KEY_AUTH` environment variable at runtime. When it is `true`, `AzureKeyCredential` is used with the injected `SearchApiKey`; otherwise `DefaultAzureCredential` is used (keyless default). The same logic applies to the `bulk-insert` seed hook. No code changes needed to switch modes.

> [!NOTE]
> **Why these deployment files**
> - **Client runtime config (`docker-entrypoint.sh` + `/config.js` + `url-fetch.js`)**: Vite bakes `VITE_*` env at BUILD time, but the backend's Container Apps FQDN isn't known until provisioning; the client reads the backend URL at container start via an injected `/config.js` (`window.__APP_CONFIG__`). Deployment wiring, not app logic.
> - **bulk-insert azd seed hook**: the sample needs a populated search index to function; wiring `bulk-insert` as an `azd` postprovision hook (reading connection info from the provisioned resources via env) auto-seeds the index on `azd up` instead of manually editing placeholder constants.

To redeploy after code changes: `azd deploy`

## Browse the deployed app

After `azd up` completes, the CLI prints the URL for the client Container App. Open that URL in your browser, enter a search query such as `code`, and review the results.