# Stage 1: Build the application
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build-env

WORKDIR /src
COPY . ./

# Restore and publish the project
RUN dotnet publish *.csproj -c Release -o /home/site/wwwroot

# Stage 2: Create the runtime image
FROM mcr.microsoft.com/azure-functions/dotnet-isolated:4-dotnet-isolated9.0

ENV AzureWebJobsScriptRoot=/home/site/wwwroot \
    AzureFunctionsJobHost__Logging__Console__IsEnabled=true

# Copy the published output from the build stage
COPY --from=build-env /home/site/wwwroot /home/site/wwwroot

EXPOSE 80
