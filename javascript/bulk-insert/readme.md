# JavaScript bulk-insert: Create Azure AI Search Index from CSV file

1. Check your search service to make sure you have room for an extra index. The Usage tab in the Azure portal's search service page provides this information. The maximum limit on the free tier is 3 indexes. The maximum limit on the basic tier is 15 indexes.

1. Change the following values in the `bulk_insert_books.js` file:

    * YOUR-SEARCH-RESOURCE-NAME (not the full URL)
    * YOUR-SEARCH-ADMIN-KEY

1. Open an integrated terminal in Visual Studio Code.

1. Make sure the path is "azure-search-static-web-app/javascript/bulk-insert".

1. Install the dependencies:

    ```bash
    npm install 
    ```

1. Run the program:

    ```bash
    npm start
    ```

1. You should see the following output:

    ```bash
    1000
    ...
    1999
    BATCH SENT
    2000
    ...
    2999
    BATCH SENT
    3000
    ...
    3999
    BATCH SENT
    4000
    ...
    4999
    BATCH SENT
    5000
    ...
    5999
    BATCH SENT
    6000
    ...
    6999
    BATCH SENT
    7000
    ...
    7999
    BATCH SENT
    8000
    ...
    8999
    BATCH SENT
    9000
    ...
    9999
    BATCH SENT
    book list data inserted
    data inserted into index
    ```
