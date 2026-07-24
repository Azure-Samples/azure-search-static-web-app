using Azure;
using Azure.Core.Serialization;
using Azure.Identity;
using Azure.Search.Documents;
using Azure.Search.Documents.Models;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Text.Json;
using WebSearch.Models;

namespace WebSearch.Function
{
    public class Lookup
    {
        private static string searchApiKey = Environment.GetEnvironmentVariable("SearchApiKey", EnvironmentVariableTarget.Process);
        private static string searchServiceName = Environment.GetEnvironmentVariable("SearchServiceName", EnvironmentVariableTarget.Process);
        private static string searchIndexName = Environment.GetEnvironmentVariable("SearchIndexName", EnvironmentVariableTarget.Process) ?? "good-books";
        private static bool useKeyAuth = string.Equals(
            Environment.GetEnvironmentVariable("SEARCH_USE_KEY_AUTH", EnvironmentVariableTarget.Process),
            "true",
            StringComparison.OrdinalIgnoreCase);

        private readonly ILogger<Lookup> _logger;

        public Lookup(ILogger<Lookup> logger)
        {
            _logger = logger;
        }


        [Function("lookup")]
        public async Task<HttpResponseData> RunAsync(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", "post")] HttpRequestData req, 
            FunctionContext executionContext)
        {

            // Get Document Id
            var query = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
            string documentId = query["id"].ToString();

            // Azure AI Search 
            Uri serviceEndpoint = new($"https://{searchServiceName}.search.windows.net/");

            SearchClient searchClient;
            if (useKeyAuth)
            {
                searchClient = new SearchClient(
                    serviceEndpoint,
                    searchIndexName,
                    new AzureKeyCredential(searchApiKey ?? throw new InvalidOperationException("SearchApiKey environment variable is required when SEARCH_USE_KEY_AUTH is true.")));
            }
            else
            {
                searchClient = new SearchClient(serviceEndpoint, searchIndexName, new DefaultAzureCredential());
            }

            var getDocumentResponse = await searchClient.GetDocumentAsync<SearchDocument>(documentId);

            // Data to return 
            var output = new LookupOutput
            {
                Document = getDocumentResponse.Value
            };

            var response = req.CreateResponse(HttpStatusCode.Found);

            // Serialize data
            var serializer = new JsonObjectSerializer(
                new JsonSerializerOptions(JsonSerializerDefaults.Web));
            await response.WriteAsJsonAsync(output, serializer);

            return response;
        }
    }
}
