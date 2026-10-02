using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using Common.Diagnostics.Azure;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.FileProviders;
using Scalar.AspNetCore;
using Serilog;
using Serilog.Events;
using Taskly.Common.Security.Options;
using Taskly.Web.Demo;
using Taskly.Web.Infrastructure;
using Taskly.Web.Infrastructure.Security.Cors;
using Taskly.Web.Infrastructure.Security.Csp;
using Taskly.Web.Infrastructure.Security.Headers;

// Declared with the others in the analytics API, which sections the digest.
const string CapturedApp = "Taskly";

var builder = WebApplication.CreateBuilder(args);

// ---- Logging (Serilog) ----
builder.Host.UseSerilog(
    (context, loggerConfiguration) => loggerConfiguration
        .MinimumLevel.Information()
        .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
        .Enrich.FromLogContext()
        .WriteTo.Console(theme: SerilogConsoleTheme.Theme),
    writeToProviders: true);

// ---- Services ----
var services = builder.Services;

services
    .AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

// Writes captured entries into the shared log table the analytics API reads back. With no
// storage connection this registers nothing and console logging is unchanged.
services.AddLogCapture(builder.Configuration, CapturedApp);

services.AddMemoryCache();
services.AddResponseCompression();
services.AddProblemDetails();
services.AddExceptionHandler<ApiExceptionHandler>();
services.AddOpenApi();

// Security features (kept from the full app — no auth/EF dependency):
// security headers + CSP, CORS, rate limiting. No antiforgery: the demo's one endpoint is a GET,
// so there is no token to validate, and registering it generates data-protection keys that are
// lost with every container.
var securityHeadersOptions = builder.Configuration.GetSection("Security").Get<SecurityHeadersPolicyOptions>()
    ?? new SecurityHeadersPolicyOptions();
var cspOptions = builder.Configuration.GetSection(CspPolicyOptions.SectionName).Get<CspPolicyOptions>()
    ?? new CspPolicyOptions();
var corsOptions = builder.Configuration.GetSection(CorsPolicyOptions.SectionName).Get<CorsPolicyOptions>()
    ?? new CorsPolicyOptions();

services.AddSingleton(securityHeadersOptions);
services.AddSingleton(cspOptions);
services.AddScoped<INonceService, NonceService>();

// Deployed origin comes from Security__Cors__AllowedOrigins__0 as a real environment variable
// (ASP.NET Core's double-underscore binding), not a token inside this file: nothing here expands
// a placeholder string.
services.AddCors(options => options.AddPolicy(
    "frontend",
    policy => CorsPolicyFactory.Configure(policy, corsOptions)));

// The rate limiter partitions on the caller's address below. Behind a reverse proxy that address
// is the proxy's own, so every caller collapses into one partition without this: it rewrites
// HttpContext.Connection.RemoteIpAddress from X-Forwarded-For before the limiter reads it.
// KnownNetworks/KnownProxies are cleared because the platform ingress IP is not static; the
// container is never reachable except through it, so the header is trustworthy at that hop.
services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();
});

services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 200,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
            }));
});

// Demo backend: in-memory store + Managers (write) / Providers (read) + seed.
services.AddSingleton<DemoSeedManager>();
services.AddSingleton<IDemoStore, DemoStore>();
services.AddSingleton<DemoSeedProvider>();
services.AddSingleton<TaskItemProvider>();
services.AddSingleton<TaskItemManager>();

var app = builder.Build();

// ---- Pipeline ----
app.UseForwardedHeaders();
app.UseExceptionHandler();
if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}

app.UseResponseCompression();
app.UseSecurityHeaders();
app.UseRouting();
app.UseCors("frontend");
app.UseRateLimiter();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(options => options.Title = "Taskly Demo API");
}

app.MapControllers();
app.MapTasklyHealth(app.Configuration.GetSection(HealthEndpoints.WakeOriginsKey).Get<string[]>() ?? []);
ConfigureStaticAssets(app);

app.Lifetime.ApplicationStarted.Register(() =>
    Log.ForContext("SourceContext", "Startup").Information(
        "Taskly Demo started ({Environment}) at {Timestamp} UTC",
        app.Environment.EnvironmentName,
        DateTimeOffset.UtcNow.ToString("G", CultureInfo.CurrentCulture)));

await app.RunAsync();

// ---- Static SPA serving (production: wwwroot/browser/index.csr.html; dev: wwwroot/index.html) ----
static void ConfigureStaticAssets(WebApplication app)
{
    var webRootPath = app.Environment.WebRootPath ?? string.Empty;
    var ssrPath = Path.Combine(webRootPath, "browser");
    var ssrIndexFile = Path.Combine(ssrPath, "index.csr.html");

    string clientDistPath;
    string indexFileName;

    if (Directory.Exists(ssrPath) && File.Exists(ssrIndexFile))
    {
        clientDistPath = ssrPath;
        indexFileName = "index.csr.html";
    }
    else if (File.Exists(Path.Combine(webRootPath, "index.html")))
    {
        clientDistPath = webRootPath;
        indexFileName = "index.html";
    }
    else
    {
        app.MapFallback(context =>
        {
            context.Response.StatusCode = StatusCodes.Status503ServiceUnavailable;
            return context.Response.WriteAsync("Client build not found. Run the Angular build (npm run dev:build).");
        });
        return;
    }

    var clientFileProvider = new PhysicalFileProvider(clientDistPath);
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = clientFileProvider,
        OnPrepareResponse = SetCacheHeaders,
    });

    // The page itself is written rather than served from disk: the Angular build emits an inline
    // script, and it needs this request's nonce or the policy blocks it.
    var indexWriter = new IndexHtmlNonceWriter(Path.Combine(clientDistPath, indexFileName));
    if (indexWriter.HasTemplate)
    {
        app.MapGet("/", indexWriter.WriteAsync);
        app.MapFallback(indexWriter.WriteAsync);
        return;
    }

    app.UseDefaultFiles(new DefaultFilesOptions
    {
        FileProvider = clientFileProvider,
        DefaultFileNames = [indexFileName],
    });
    app.MapFallbackToFile(indexFileName, new StaticFileOptions
    {
        FileProvider = clientFileProvider,
        OnPrepareResponse = SetCacheHeaders,
    });
}

static void SetCacheHeaders(StaticFileResponseContext context)
{
    var headers = context.Context.Response.Headers;
    if (context.File.Name.EndsWith(".html", StringComparison.OrdinalIgnoreCase))
    {
        headers.CacheControl = "no-cache, no-store, must-revalidate";
    }
    else
    {
        headers.CacheControl = "public, max-age=86400, must-revalidate";
    }
}
