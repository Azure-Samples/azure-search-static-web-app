using Azure;
using Azure.Identity;
using Azure.Search.Documents;
using Azure.Search.Documents.Indexes;
using Azure.Search.Documents.Indexes.Models;
using AzureSearch.BulkInsert;
using ServiceStack;

const string BOOKS_URL = "https://raw.githubusercontent.com/Azure-Samples/azure-search-sample-data/main/good-books/books.csv";
string SEARCH_SERVICE_NAME = Environment.GetEnvironmentVariable("SEARCH_SERVICE_NAME") ?? throw new InvalidOperationException("SEARCH_SERVICE_NAME environment variable is not set.");
string SEARCH_INDEX_NAME = Environment.GetEnvironmentVariable("SEARCH_INDEX_NAME") ?? "good-books";
string? SEARCH_API_KEY = Environment.GetEnvironmentVariable("SEARCH_API_KEY");
string SEARCH_ENDPOINT = $"https://{SEARCH_SERVICE_NAME}.search.windows.net";

Uri searchEndpointUri = new(SEARCH_ENDPOINT);

SearchClient client = string.IsNullOrEmpty(SEARCH_API_KEY)
    ? new(searchEndpointUri, SEARCH_INDEX_NAME, new DefaultAzureCredential())
    : new(searchEndpointUri, SEARCH_INDEX_NAME, new AzureKeyCredential(SEARCH_API_KEY));

SearchIndexClient clientIndex = string.IsNullOrEmpty(SEARCH_API_KEY)
    ? new(searchEndpointUri, new DefaultAzureCredential())
    : new(searchEndpointUri, new AzureKeyCredential(SEARCH_API_KEY));

await CreateIndexAsync(clientIndex);
await BulkInsertAsync(client);

async Task CreateIndexAsync(SearchIndexClient clientIndex)
{
    Console.WriteLine("Creating (or updating) search index");
    SearchIndex index = new BookSearchIndex(SEARCH_INDEX_NAME);
    var result = await clientIndex.CreateOrUpdateIndexAsync(index);

    Console.WriteLine(result);
}

async Task BulkInsertAsync(SearchClient client)
{
    Console.WriteLine("Download data file");
    using HttpClient httpClient = new();

    var csv = await httpClient.GetStringAsync(BOOKS_URL);

    Console.WriteLine("Reading and parsing raw CSV data");
    var books =
        csv.ReplaceFirst("book_id", "id").FromCsv<List<BookModel>>();

    Console.WriteLine("Uploading bulk book data");
    _ = await client.UploadDocumentsAsync(books);

    Console.WriteLine("Finished bulk inserting book data");
}