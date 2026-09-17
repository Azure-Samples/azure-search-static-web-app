# Testing

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
npm run test:native
npm run test:diagnostic
npm run test:e2e
npm run test:visual
npm run test:structure
npm run test:all
Pop-Location
```

The API suite first verifies the canonical 10,000-document dataset and stable
book ID 9734. If that preflight fails, use the intended seeded environment
rather than weakening the fixture. The API currently returns HTTP 302 for
successful search, suggest, and lookup operations despite returning valid JSON.
The suite records this as a known expected failure against the HTTP 200
contract. The client `url-fetch.js` deliberately accepts statuses from 200
through 399, so HTTP 302 alone isn't proven to cause native UI rendering
failures. Successful API responses should still use HTTP 200.

The `native` browser project never intercepts, mocks, or rewrites API
responses. It passes currently working page-shell behavior and marks known
native defects as expected failures. In the latest live run against the
canonical `good-books` index, all 13 API tests passed, native suggestions
rendered despite being marked as an expected failure, native search results
still didn't render, and the existing Bootstrap mobile toggle didn't open.

The `diagnostic` and `visual-diagnostic` projects are explicitly test-only.
They intercept API calls with deterministic HTTP 200 fixtures to isolate
client rendering and coordination behavior. Their passing results are not
evidence that the native API/browser path passes. Run native and diagnostic
projects separately when reporting results:

```powershell
npm run test:native
npm run test:diagnostic
npm run test:visual
```

### Visual and design-system validation

`npm run test:visual` uses deterministic test-only HTTP 200 interception and
compares the principal current-UI states with the
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
structure mode. These checks do not modify application source:

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
dependencies or imports, and no superseded JSX/CSS implementations. Visual
conformance is covered separately by computed-theme and reviewed screenshot
tests; the structure gate doesn't require rewriting PR-specific component
styles solely to satisfy a test policy.

The manual **Live Azure AI Search tests** workflow uses the protected
`live-search-tests` environment. Configure its `AZURE_CLIENT_ID`,
`AZURE_TENANT_ID`, and `AZURE_SUBSCRIPTION_ID` variables for federated Azure
login, then provide the existing search service, index, client URL, and API URL
when dispatching the workflow.
