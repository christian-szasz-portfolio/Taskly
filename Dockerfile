# syntax=docker/dockerfile:1
# The Taskly demo, built from the repository root:
#
#     docker build --secret id=github_packages_user,env=GITHUB_PACKAGES_USER \
#         --secret id=github_packages_token,env=GITHUB_PACKAGES_TOKEN -t taskly-demo .
#
# The context is the root because Directory.Build.props and stylecop.json decide the rules the
# code is compiled under.

# The Angular client. Its vite config writes to ../wwwroot, so the output lands at /wwwroot.
FROM node:22 AS client
WORKDIR /client

# The manifests and the patches first: postinstall runs patch-package, which needs them.
COPY src/Taskly.Web/ClientApp/package.json src/Taskly.Web/ClientApp/package-lock.json ./
COPY src/Taskly.Web/ClientApp/patches/ patches/
RUN npm ci

COPY src/Taskly.Web/ClientApp/ ./
RUN npm run build

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# The project files on their own layer, so a source change does not re-restore packages.
COPY global.json NuGet.config ./
COPY src/Directory.Build.props src/stylecop.json src/
COPY src/Taskly.Contracts/Taskly.Contracts.csproj src/Taskly.Contracts/
COPY src/Taskly.Common/Taskly.Common.csproj src/Taskly.Common/
COPY src/Taskly.Web/Taskly.Web.csproj src/Taskly.Web/
# The shared Common.* packages come from the private GitHub Packages feed NuGet.config names.
# Its token is a build secret, so it never lands in a layer or the image history.
RUN --mount=type=secret,id=github_packages_user,env=GITHUB_PACKAGES_USER \
    --mount=type=secret,id=github_packages_token,env=GITHUB_PACKAGES_TOKEN \
    dotnet restore src/Taskly.Web/Taskly.Web.csproj

COPY src/ src/

# The csproj publishes wwwroot as content, so the client has to be in place before it runs.
COPY --from=client /wwwroot src/Taskly.Web/wwwroot
RUN dotnet publish src/Taskly.Web/Taskly.Web.csproj -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

# The demo data lives in memory and the client is served from the image, so nothing is written.
USER $APP_UID

COPY --from=build /app .

# The platform terminates TLS in front of this, so the container serves plain HTTP on 8080.
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "Taskly.Web.dll"]
