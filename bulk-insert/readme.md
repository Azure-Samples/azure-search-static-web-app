# .NET bulk-insert: Create Azure AI Search Index from CSV file

1. Check your search service to make sure you have room for an extra index. The Usage tab in the Azure portal's search service page provides this information. The maximum limit on the free tier is 3 indexes. The maximum limit on the basic tier is 15 indexes.

1. Check your search service to make sure it allows API keys. API key settings can be found in the **Settings > Keys** page in the Azure portal's search service page.

1. Change the following values in the `Program.cs` file:

    * YOUR-SEARCH-RESOURCE-NAME (not the full URL)
    * YOUR-SEARCH-ADMIN-KEY

1. Open an integrated terminal in Visual Studio Code.

1. Make sure the path is "azure-search-static-web-app/bulk-insert".

1. Install dependencies:

    ```bash
    dotnet restore
    ```

1. Run the program:

    ```bash
    dotnet run
    ```

1. You should see the following output.

    ```bash
    Creating (or updating) search index
    Status: 201, Value: Azure.Search.Documents.Indexes.Models.SearchIndex
    Download data file
    Reading and parsing raw CSV data
    Uploading bulk book data
    Finished bulk inserting book data
    ```
