using Azure.Core.Serialization;
using Microsoft.Azure.Functions.Worker.Http;
using System.Net;
using System.Text.Json;

namespace WebSearch.Function
{
    internal static class ApiResponses
    {
        private static readonly JsonObjectSerializer Serializer = new(
            new JsonSerializerOptions(JsonSerializerDefaults.Web));

        public static async Task<HttpResponseData> WriteErrorAsync(
            HttpRequestData request,
            HttpStatusCode status,
            string message)
        {
            var response = request.CreateResponse(status);
            await response.WriteAsJsonAsync(new { error = message }, Serializer);
            return response;
        }
    }
}
