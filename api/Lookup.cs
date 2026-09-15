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
            string? documentId = query["id"];
            if (string.IsNullOrWhiteSpace(documentId))
            {
                return await ApiResponses.WriteErrorAsync(
                    req,
                    HttpStatusCode.BadRequest,
                    "The id query parameter is required.");
            }

            // Azure AI Search (managed identity by default; API key only when SEARCH_USE_KEY_AUTH=true)
            SearchClient searchClient = SearchClientFactory.CreateSearchClient();

            Response<SearchDocument> getDocumentResponse;
            try
            {
                getDocumentResponse = await searchClient.GetDocumentAsync<SearchDocument>(documentId);
            }
            catch (RequestFailedException exception) when (exception.Status == (int)HttpStatusCode.NotFound)
            {
                return await ApiResponses.WriteErrorAsync(
                    req,
                    HttpStatusCode.NotFound,
                    $"Document '{documentId}' was not found.");
            }

            // Data to return 
            var output = new LookupOutput
            {
                Document = getDocumentResponse.Value
            };

            var response = req.CreateResponse(HttpStatusCode.OK);

            // Serialize data
            var serializer = new JsonObjectSerializer(
                new JsonSerializerOptions(JsonSerializerDefaults.Web));
            await response.WriteAsJsonAsync(output, serializer);

            return response;
        }
    }
}
