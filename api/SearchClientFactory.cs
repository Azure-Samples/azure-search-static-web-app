using Azure;
using Azure.Identity;
using Azure.Search.Documents;

namespace WebSearch.Function
{
    // Centralizes Azure AI Search client creation so every function authenticates
    // the same way. Managed identity is the default; API-key auth is used only when
    // SEARCH_USE_KEY_AUTH=true. This keeps the sample's keyless-first posture
    // consistent and avoids each function drifting to a different credential.
    internal static class SearchClientFactory
    {
        private static readonly string SearchServiceName =
            Environment.GetEnvironmentVariable("SearchServiceName", EnvironmentVariableTarget.Process);

        private static readonly string SearchIndexName =
            Environment.GetEnvironmentVariable("SearchIndexName", EnvironmentVariableTarget.Process) ?? "good-books";

        private static readonly string SearchApiKey =
            Environment.GetEnvironmentVariable("SearchApiKey", EnvironmentVariableTarget.Process);

        // Set by infra (AZURE_CLIENT_ID) to the user-assigned managed identity's client ID.
        private static readonly string ManagedIdentityClientId =
            Environment.GetEnvironmentVariable("AZURE_CLIENT_ID", EnvironmentVariableTarget.Process);

        private static readonly bool UseKeyAuth = string.Equals(
            Environment.GetEnvironmentVariable("SEARCH_USE_KEY_AUTH", EnvironmentVariableTarget.Process),
            "true",
            StringComparison.OrdinalIgnoreCase);

        // Builds a SearchClient for the configured index using the selected credential.
        public static SearchClient CreateSearchClient()
        {
            if (string.IsNullOrWhiteSpace(SearchServiceName))
                throw new InvalidOperationException("SearchServiceName environment variable is not set. It is required to build the Azure AI Search endpoint URI.");

            Uri serviceEndpoint = new($"https://{SearchServiceName}.search.windows.net/");

            if (UseKeyAuth)
            {
                return new SearchClient(
                    serviceEndpoint,
                    SearchIndexName,
                    new AzureKeyCredential(SearchApiKey
                        ?? throw new InvalidOperationException(
                            "SearchApiKey environment variable is required when SEARCH_USE_KEY_AUTH is true.")));
            }

            return new SearchClient(serviceEndpoint, SearchIndexName, CreateManagedIdentityCredential());
        }

        // DefaultAzureCredential must be told which identity to use when a user-assigned
        // managed identity is present (as provisioned by the Bicep infra). Without the
        // client ID, token acquisition is ambiguous on hosts that expose more than one
        // identity, which is why plain "new DefaultAzureCredential()" fails at runtime.
        private static DefaultAzureCredential CreateManagedIdentityCredential()
        {
            var options = new DefaultAzureCredentialOptions();

            if (!string.IsNullOrWhiteSpace(ManagedIdentityClientId))
            {
                options.ManagedIdentityClientId = ManagedIdentityClientId;
            }

            return new DefaultAzureCredential(options);
        }
    }
}
