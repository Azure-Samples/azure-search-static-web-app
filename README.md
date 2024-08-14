
# Readme: Static Web App for Azure AI Search

This code sample builds a web site on Azure to search through a catalog of books. Searchable content is indexed and queried on Azure AI Search, and a static web app provides the search experience.

This sample includes two programs and an Azure function.

| components | Description |
|---------|-------------|
| bulk-insert app | Creates and loads the "goodbooks" index on Azure AI Search. It demonstrates index creation and batch mode indexing. Sample data is loaded from the [azure-search-sample-data](https://github.com/Azure-Samples/azure-search-sample-data/tree/main/good-books) repository. To run this program, you must have write permissions on Azure AI Search. <p>This program is available in three languages: <br>/dotnet/bulk-insert <br>/python/bulk-insert <br>/javascript/bulk-insert|
| client app | Provides the client code. The web front-end includes a search page with faceted navigation, a search bar for free form search and suggested queries, and tabbed page results. It's written in JavaScript, uses Node.js for the runtime, and uses React libraries for user interaction. |
| api | Provides the Azure function used by the client to send queries to the search index. <p>The function is available in three languages: <br>/dotnet/api (.NET) <br>/python/api <br>/javascript/api |

This README is an shortened version of the [full tutorial](https://aka.ms/search-website-tutorial) and provides just the steps for running the sample. For more information and screenshots, see the tutorial.

## Prerequisites

* [Node.js](https://nodejs.org/en/download/package-manager)
* [Git](https://git-scm.com/downloads)
* [Visual Studio Code](https://code.visualstudio.com/Download)
* [Azure AI Search](https://docs.microsoft.com/azure/search/search-create-service-portal).
* [Azure Functions extension for Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurefunctions&WT.mc_id=shopathome-github-jopapa)
* [Azure Functions Core Tools](https://docs.microsoft.com/azure/azure-functions/functions-run-local?WT.mc_id=shopathome-github-jopapa)

You should also have the Visual Studio code extension for the language used for building the index:

* [Python extension for Visual Studio Code](https://code.visualstudio.com/docs/languages/python) and a recent version of Python.
* [JavaScript extensions for VS Code](https://code.visualstudio.com/docs/nodejs/extensions).
* [Using .NET in Visual Studio Code](https://code.visualstudio.com/docs/languages/dotnet) and a recent of the .NET SDK.

## Download sample repository

1. On GitHub, fork the repository.

1. In a terminal, use git to clone this repository to your local computer:

    ```bash
    git clone https://github.com/Azure-Samples/azure-search-static-web-app
    ```

1. Open that local directory in Visual Studio Code.

## Run Bulk Insert

Use any one of the following language versions to build the good-books index. Instructions are provided in individual readme files. All of these programs assume Visual Studio Code as the IDE with the appropriate language extensions and executables.

* [/dotnet/bulk-insert/readme](/dotnet/bulk-insert/readme.md)

* [/javascript/bulk-insert/readme](/javascript/bulk-insert/readme.md)

* [/python/bulk-insert/readme](/python/bulk-insert/readme.md)

To run any of these programs, you need the search endpoint and [API keys](https://learn.microsoft.com/azure/search/search-security-api-keys#find-existing-keys). You can find this information in the Azure portal.

## Deploy the static web app

Once you have the good-books index on Azure AI Search, you can deploy a static web app as your search client.

Deploy the app from Visual Studio Code using the **Create Static Web App (Advanced)** wizard. In the wizard, you are prompted to set the location of your application code. This is the "language-of-choice"/api folder containing the Azure function, using for making calls to Azure AI Search.

1. In Visual Studio Code in Explorer, make sure you're at the repository root, and not the bulk-insert folder (for example, `azure-search-static-web-app`).

1. Select **Azure** from the Activity Bar, then open **Resources** from the side bar. 

1. Right-click **Static Web Apps** and then select **Create Static Web App (Advanced)**. If you don't see this option, verify that you have the Azure Functions extension for Visual Studio Code.

1. If you see a pop-up window in Visual Studio Code asking which branch you want to deploy from, select the default branch, usually **main**. 

    This setting means only changes you commit to that branch are deployed to your static web app. 

1. If you see a pop-up window asking you to commit your changes, don't do this. The secrets from the bulk import step shouldn't be committed to the repository. 

    To roll back the changes, open an integrated terminal window and type `git checkout .` to undo the commit.

1. Follow the prompts to create the static web app:

    |Prompt|Enter|
    |--|--|
    |Select a resource group for the new resources. | Create a new resource group for the static web app.  |
    |Enter the name for the new Static Web App. | Create a unique name for your web app, such as `my-demo-app`. |
    |Select a SKU | Select the free SKU for this tutorial.|
    |Select a region | We recommend `West US 2`. |
    |Choose build preset to configure default project structure. |Select **Custom**. |
    |Select the location of your client application code | `client`<br><br>This is the path, from the root of the repository, to your static web app. |
    |Select the location of your function code | `dotnet\api`, for example.<br><br>Azure functions are provided in three languages. You can choose any one of them. |
    |Enter the path of your build output... | `build`<br><br>This is the path, from your static web app, to your generated files.|

    If you get an error about an incorrect region, make sure the resource group and static web app resource are in one of the supported regions listed in the error response. 

1. When the static web app is created, a GitHub workflow YML file is also created locally and on GitHub in your fork. This workflow executes in your fork, building and deploying the static web app and functions.

   Check the status of static web app deployment using either of these approaches:

   * Select **Open Actions in GitHub** from the Notifications. This opens a browser window pointed to your forked repo.
   * Select the **Actions** tab in your forked repository. You should see a list of all workflows on your fork.

   It's expected that the workflow succeeds. However, the Git workflow builds the YML file using a backward slash file delimiter, resulting in an invalid path for locating the API folder. Inside theBuild and Deploy Job output, you'll find a warning similar to this: "`[WARNING] Api Directory Location: 'javascriptpi' could not be found. Azure Functions will not be created. Either no Api directory was specified, or the specified directory was not found. Azure Functions will not be created.`".

1. Edit the YML to change the backward slash to a forward slash. You can perform this step as soon as the YML file is created. A new workflow launches as soon as you push the updates.

   1. In Visual Studio Code explorer, open the `./.github/workflows/` directory.

   1. Open the YML file.

   1. Scroll to the `api-location` path (on or near line 31).

   1. Replace the backslash (`dotnet\api`) with a forward slash (`dotnet/api`). This is the only line that needs editing, other locations are here for context:

      ```yml
      app_location: "client" # App source code path
      api_location: "dotnet/api" # Api source code path - optional
      output_location: "build" # Built app content directory - optional
      ```

   1. Save the file.

   1. Open an integrated terminal and issue the following GitHub commands to send the updated YML to your fork:

      ```bash
      git add -A
      git commit -m "fix path"
      git push origin main
      ```

    Wait until the workflow execution completes before continuing. This may take a minute or two to finish. 

## Get the Azure AI Search query key in Visual Studio Code

1. In Visual Studio Code, open a new terminal window.

1. Get the query API key with this Azure CLI command:

    ```azurecli
    az search query-key list --resource-group cognitive-search-demo-rg --service-name my-cog-search-demo-svc
    ```

1. Keep this query key to use in the next section. The query key authorizes read access to a search index. 

## Add environment variables in Azure portal

The Azure Function app won't return search data until the search secrets are in settings. 

1. Select **Azure** from the Activity Bar. 

1. Right-click on your Static Web Apps resource then select **Open in Portal**.

1. Select **Environment variables** then select **+ Add application setting**.

1. Add each of the following settings:

    |Setting|Your Search resource value|
    |--|--|
    |SearchApiKey|Your search query key|
    |SearchServiceName|Your search resource name|
    |SearchIndexName|`good-books`|
    |SearchFacets|`authors*,language_code`|

    Azure AI Search requires different syntax for filtering collections than it does for strings. Add a `*` after a field name to denote that the field is of type `Collection(Edm.String)`. This allows the Azure Function to add filters correctly to queries.

1. Return to Visual Studio Code. 

1. Refresh your static web app to see the application settings and functions.

If you don't see the application settings, revisit the steps for updating and relaunching the GitHub workflow.

## Use search in your static web app

1. In Visual Studio Code, open the [Activity bar](https://code.visualstudio.com/docs/getstarted/userinterface), and select the Azure icon.

1. In the Side bar, **right-click on your Azure subscription** under the `Static Web Apps` area and find the static web app you created for this tutorial.

1. Right-click the static web app name and select **Browse site**.

1. Select **Open** in the pop-up dialog.

1. In the website search bar, enter a search query such as `code`, so the suggest feature suggests book titles. Select a suggestion or continue entering your own query. Press enter when you've completed your search query. 

1. Review the results then select one of the books to see more details.
