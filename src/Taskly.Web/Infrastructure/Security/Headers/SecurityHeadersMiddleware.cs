namespace Taskly.Web.Infrastructure.Security.Headers;

using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using Taskly.Common.Security.Options;
using Taskly.Web.Infrastructure.Security.Csp;

/// <summary>
/// Middleware that adds comprehensive security headers to all responses.
/// Implements OWASP security header recommendations.
/// </summary>
/// <remarks>
/// Initializes a new instance of the <see cref="SecurityHeadersMiddleware"/> class.
/// </remarks>
/// <param name="next">The next middleware in the pipeline.</param>
/// <param name="environment">The host environment.</param>
/// <param name="securityHeadersOptions">The security headers configuration options.</param>
/// <param name="cspOptions">The CSP configuration options.</param>
public sealed class SecurityHeadersMiddleware(
    RequestDelegate next,
    IHostEnvironment environment,
    SecurityHeadersPolicyOptions securityHeadersOptions,
    CspPolicyOptions cspOptions)
{
    /// <summary>Where the request's nonce is left for whatever renders the page.</summary>
    public const string NonceItemKey = "CSP-Nonce";

    private readonly RequestDelegate next = next;
    private readonly IHostEnvironment environment = environment;
    private readonly SecurityHeadersPolicyOptions securityHeadersOptions = securityHeadersOptions;
    private readonly CspPolicyOptions cspOptions = cspOptions;

    /// <summary>
    /// Invokes the middleware.
    /// </summary>
    /// <param name="context">The HTTP context.</param>
    /// <param name="nonceService">The nonce service for CSP.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    public async Task InvokeAsync(HttpContext context, INonceService nonceService)
    {
        var isDevelopment = this.environment.IsDevelopment();
        var requestPath = context.Request.Path;

        // Skip document-level security headers for API routes and Scalar docs.
        // CSP, COEP, CORP, and X-Frame-Options are only meaningful for HTML document
        // responses. Applying them to API/JSON responses is unnecessary and can cause
        // browsers to misreport COEP violations as CSP blocks.
        var isApiPath = requestPath.StartsWithSegments("/api");
        var isScalarPath = isDevelopment && (
            requestPath.StartsWithSegments("/scalar") ||
            requestPath.StartsWithSegments("/openapi"));
        var skipDocumentHeaders = isApiPath || isScalarPath;

        // Store nonce in HttpContext.Items for access in views/components
        context.Items[NonceItemKey] = nonceService.Nonce;

        // Add security headers before the response starts
        context.Response.OnStarting(() =>
        {
            var headers = context.Response.Headers;

            this.AddStandardSecurityHeaders(headers, isDevelopment);

            if (!skipDocumentHeaders)
            {
                this.AddContentSecurityPolicy(headers, nonceService.Nonce, isDevelopment);
                this.AddCrossOriginHeaders(headers);
            }

            AddCacheControlHeaders(headers, requestPath);

            return Task.CompletedTask;
        });

        await this.next(context);
    }

    private static void AddCacheControlHeaders(IHeaderDictionary headers, PathString requestPath)
    {
        // Prevent caching of sensitive responses (auth endpoints)
        if (requestPath.StartsWithSegments("/api/auth"))
        {
            headers.CacheControl = "no-store, no-cache, must-revalidate, private";
            headers.Pragma = "no-cache";
            headers.Expires = "0";
        }

        // Prevent caching of API responses by default
        if (requestPath.StartsWithSegments("/api") && !headers.ContainsKey("Cache-Control"))
        {
            headers.CacheControl = "no-store, private";
        }
    }

    private void AddCrossOriginHeaders(IHeaderDictionary headers)
    {
        // Cross-Origin-Embedder-Policy - requires all resources to grant permission
        headers["Cross-Origin-Embedder-Policy"] = this.securityHeadersOptions.CrossOriginEmbedderPolicy;

        // Cross-Origin-Opener-Policy - isolates browsing context
        headers["Cross-Origin-Opener-Policy"] = this.securityHeadersOptions.CrossOriginOpenerPolicy;

        // Cross-Origin-Resource-Policy - restricts resource loading to same-origin
        headers["Cross-Origin-Resource-Policy"] = this.securityHeadersOptions.CrossOriginResourcePolicy;
    }

    private void AddStandardSecurityHeaders(IHeaderDictionary headers, bool isDevelopment)
    {
        // Prevent MIME type sniffing - forces browser to use declared content-type
        headers.XContentTypeOptions = this.securityHeadersOptions.XContentTypeOptions;

        // Prevent clickjacking - deny all framing
        headers.XFrameOptions = this.securityHeadersOptions.XFrameOptions;

        // XSS protection (legacy browsers)
        // Modern browsers use CSP instead, but this provides defense-in-depth
        headers.XXSSProtection = this.securityHeadersOptions.XXSSProtection;

        // Control referrer information - send origin only for cross-origin requests
        headers["Referrer-Policy"] = this.securityHeadersOptions.ReferrerPolicy;

        // Restrict browser features/APIs - deny access to sensitive capabilities
        headers["Permissions-Policy"] = this.securityHeadersOptions.PermissionsPolicy;

        // Remove identifying headers if configured
        if (this.securityHeadersOptions.RemoveServerHeader)
        {
            headers.Remove("Server");
        }

        if (this.securityHeadersOptions.RemoveXPoweredByHeader)
        {
            headers.Remove("X-Powered-By");
        }

        // HTTP Strict Transport Security
        var enableHsts = this.securityHeadersOptions.EnableHsts && (!isDevelopment || this.securityHeadersOptions.EnableHstsInDevelopment);
        if (enableHsts)
        {
            var hstsValue = $"max-age={this.securityHeadersOptions.HstsMaxAgeSeconds}";
            if (this.securityHeadersOptions.HstsIncludeSubDomains)
            {
                hstsValue += "; includeSubDomains";
            }

            if (this.securityHeadersOptions.HstsPreload)
            {
                hstsValue += "; preload";
            }

            headers.StrictTransportSecurity = hstsValue;
        }
    }

    private void AddContentSecurityPolicy(IHeaderDictionary headers, string nonce, bool isDevelopment)
    {
        if (!this.cspOptions.Enabled)
        {
            return;
        }

        var cspBuilder = new ContentSecurityPolicyBuilder(nonce, isDevelopment, this.cspOptions);
        var cspValue = cspBuilder.Build();

        if (this.cspOptions.ReportOnly)
        {
            headers.ContentSecurityPolicyReportOnly = cspValue;
        }
        else
        {
            headers.ContentSecurityPolicy = cspValue;
        }
    }
}
