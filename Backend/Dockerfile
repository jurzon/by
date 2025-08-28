# BY API Docker file

# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy project files
COPY ["BY.API/BY.API.csproj", "BY.API/"]
COPY ["BY.Infrastructure/BY.Infrastructure.csproj", "BY.Infrastructure/"]
COPY ["BY.Core/BY.Core.csproj", "BY.Core/"]

# Restore dependencies
RUN dotnet restore "BY.API/BY.API.csproj"

# Copy source code
COPY . .

# Build the application
WORKDIR "/src/BY.API"
RUN dotnet build "BY.API.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "BY.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy published application
COPY --from=publish /app/publish .

# Create a non-root user
RUN useradd -m -s /bin/bash appuser && chown -R appuser:appuser /app
USER appuser

# Expose ports
EXPOSE 8080
EXPOSE 8081

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Entry point
ENTRYPOINT ["dotnet", "BY.API.dll"]