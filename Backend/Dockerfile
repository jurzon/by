# BY API Docker file
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy project files
COPY ["Backend/BY.API/BY.API.csproj", "BY.API/"]
COPY ["Backend/BY.Core/BY.Core.csproj", "BY.Core/"]
COPY ["Backend/BY.Infrastructure/BY.Infrastructure.csproj", "BY.Infrastructure/"]

# Restore dependencies
RUN dotnet restore "BY.API/BY.API.csproj"

# Copy all source code
COPY Backend/ .

# Build the application
WORKDIR "/src/BY.API"
RUN dotnet build "BY.API.csproj" -c Release -o /app/build

# Publish the application
FROM build AS publish
RUN dotnet publish "BY.API.csproj" -c Release -o /app/publish

# Final image
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "BY.API.dll"]