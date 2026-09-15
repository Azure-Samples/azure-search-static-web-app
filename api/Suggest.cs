using Azure;
using Azure.Core.Serialization;
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
    public class Suggest
    {
        private readonly ILogger<Lookup> _logger;

        public Suggest(ILogger<Lookup> logger)
        {
            _logger = logger;
        }

        [Function("suggest")]
        public async Task<HttpResponseData> RunAsync(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequestData req, 
            FunctionContext executionContext)
        {
            // Get Document Id
            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            var data = JsonSerializer.Deserialize<RequestBodySuggest>(requestBody);
            if (data is null ||
                string.IsNullOrWhiteSpace(data.SearchText) ||
                string.IsNullOrWhiteSpace(data.SuggesterName) ||
                data.Size is < 1 or > 100)
            {
                return await ApiResponses.WriteErrorAsync(
                    req,
                    HttpStatusCode.BadRequest,
                    "The request must include q, suggester, and top between 1 and 100.");
            }

            // Azure AI Search (managed identity by default; API key only when SEARCH_USE_KEY_AUTH=true)
            SearchClient searchClient = SearchClientFactory.CreateSearchClient();

            SuggestOptions options = new()

            {
                Size = data.Size
            };

            var suggesterResponse = await searchClient.SuggestAsync<BookModel>(data.SearchText, data.SuggesterName, options);
            
            // Data to return
            var searchSuggestions = new Dictionary<string, List<SearchSuggestion<BookModel>>>
            {
                ["suggestions"] = suggesterResponse.Value.Results.ToList()
            };

            var response = req.CreateResponse(HttpStatusCode.OK);

            // Serialize data
            var serializer = new JsonObjectSerializer(
                new JsonSerializerOptions(JsonSerializerDefaults.Web));
            await response.WriteAsJsonAsync(searchSuggestions, serializer);
            
            return response;
        }
    }
}
