namespace Taskly.Web.Test.Infrastructure.Security.Headers;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.Extensions.Hosting;
using Moq;
using Taskly.Common.Security.Options;
using Taskly.Web.Infrastructure.Security.Csp;
using Taskly.Web.Infrastructure.Security.Headers;

[TestClass]
public sealed class SecurityHeadersMiddlewareTests
{
    private readonly Mock<INonceService> mockNonceService = new();
    private bool nextDelegateCalled;

    [TestInitialize]
    public void Setup()
    {
        this.mockNonceService.Setup(x => x.Nonce).Returns("test-nonce-value");
        this.nextDelegateCalled = false;
    }

    [TestMethod]
    public async Task InvokeAsync_CallsNextDelegate()
    {
        var middleware = this.CreateMiddleware(isDevelopment: false);
        _ = await this.InvokeAndFireCallbacks(middleware, "/some-page");

        Assert.IsTrue(this.nextDelegateCalled);
    }

    [TestMethod]
    public async Task InvokeAsync_StoresNonceInHttpContextItems()
    {
        var middleware = this.CreateMiddleware(isDevelopment: false);
        var context = await this.InvokeAndFireCallbacks(middleware, "/some-page");

        Assert.AreEqual("test-nonce-value", context.Items["CSP-Nonce"]);
    }

    [TestMethod]
    public async Task InvokeAsync_AddsXContentTypeOptionsHeader()
    {
        var middleware = this.CreateMiddleware(isDevelopment: false);
        var context = await this.InvokeAndFireCallbacks(middleware, "/some-page");

        Assert.AreEqual("nosniff", context.Response.Headers.XContentTypeOptions.ToString());
    }

    [TestMethod]
    public async Task InvokeAsync_AddsXFrameOptionsHeader()
    {
        var middleware = this.CreateMiddleware(isDevelopment: false);
        var context = await this.InvokeAndFireCallbacks(middleware, "/some-page");

        Assert.AreEqual("DENY", context.Response.Headers.XFrameOptions.ToString());
    }

    [TestMethod]
    public async Task InvokeAsync_AddsReferrerPolicyHeader()
    {
        var middleware = this.CreateMiddleware(isDevelopment: false);
        var context = await this.InvokeAndFireCallbacks(middleware, "/some-page");

        Assert.IsTrue(context.Response.Headers.ContainsKey("Referrer-Policy"));
    }

    [TestMethod]
    public async Task InvokeAsync_AddsPermissionsPolicyHeader()
    {
        var middleware = this.CreateMiddleware(isDevelopment: false);
        var context = await this.InvokeAndFireCallbacks(middleware, "/some-page");

        Assert.IsTrue(context.Response.Headers.ContainsKey("Permissions-Policy"));
    }

    [TestMethod]
    public async Task InvokeAsync_ForNonApiPath_AddsCspHeader()
    {
        var options = new CspPolicyOptions { Enabled = true, ReportOnly = false };
        var middleware = this.CreateMiddleware(isDevelopment: false, cspOptions: options);
        var context = await this.InvokeAndFireCallbacks(middleware, "/some-page");

        Assert.IsGreaterThan(0, context.Response.Headers.ContentSecurityPolicy.Count, "CSP header should be set for non-API paths");
    }

    [TestMethod]
    public async Task InvokeAsync_ForApiPath_DoesNotAddCspHeader()
    {
        var options = new CspPolicyOptions { Enabled = true };
        var middleware = this.CreateMiddleware(isDevelopment: false, cspOptions: options);
        var context = await this.InvokeAndFireCallbacks(middleware, "/api/test");

        Assert.AreEqual(
            0,
            context.Response.Headers.ContentSecurityPolicy.Count,
            "CSP header should not be set for API paths");
    }

    [TestMethod]
    public async Task InvokeAsync_ForApiPath_DoesNotAddCrossOriginHeaders()
    {
        var middleware = this.CreateMiddleware(isDevelopment: false);
        var context = await this.InvokeAndFireCallbacks(middleware, "/api/test");

        Assert.IsFalse(context.Response.Headers.ContainsKey("Cross-Origin-Embedder-Policy"));
    }

    [TestMethod]
    public async Task InvokeAsync_ForNonApiPath_AddsCrossOriginHeaders()
    {
        var middleware = this.CreateMiddleware(isDevelopment: false);
        var context = await this.InvokeAndFireCallbacks(middleware, "/some-page");

        Assert.IsTrue(context.Response.Headers.ContainsKey("Cross-Origin-Embedder-Policy"));
        Assert.IsTrue(context.Response.Headers.ContainsKey("Cross-Origin-Opener-Policy"));
        Assert.IsTrue(context.Response.Headers.ContainsKey("Cross-Origin-Resource-Policy"));
    }

    [TestMethod]
    public async Task InvokeAsync_ForScalarPath_InDevelopment_SkipsDocumentHeaders()
    {
        var options = new CspPolicyOptions { Enabled = true };
        var middleware = this.CreateMiddleware(isDevelopment: true, cspOptions: options);
        var context = await this.InvokeAndFireCallbacks(middleware, "/scalar/v1");

        Assert.AreEqual(0, context.Response.Headers.ContentSecurityPolicy.Count);
    }

    [TestMethod]
    public async Task InvokeAsync_ForOpenApiPath_InDevelopment_SkipsDocumentHeaders()
    {
        var options = new CspPolicyOptions { Enabled = true };
        var middleware = this.CreateMiddleware(isDevelopment: true, cspOptions: options);
        var context = await this.InvokeAndFireCallbacks(middleware, "/openapi/v1.json");

        Assert.AreEqual(0, context.Response.Headers.ContentSecurityPolicy.Count);
    }

    [TestMethod]
    public async Task InvokeAsync_ForScalarPath_InProduction_DoesNotSkip()
    {
        var options = new CspPolicyOptions { Enabled = true, ReportOnly = false };
        var middleware = this.CreateMiddleware(isDevelopment: false, cspOptions: options);
        var context = await this.InvokeAndFireCallbacks(middleware, "/scalar/v1");

        Assert.IsGreaterThan(0, context.Response.Headers.ContentSecurityPolicy.Count);
    }

    [TestMethod]
    public async Task InvokeAsync_CspDisabled_DoesNotAddCspHeader()
    {
        var options = new CspPolicyOptions { Enabled = false };
        var middleware = this.CreateMiddleware(isDevelopment: false, cspOptions: options);
        var context = await this.InvokeAndFireCallbacks(middleware, "/some-page");

        Assert.AreEqual(0, context.Response.Headers.ContentSecurityPolicy.Count);
        Assert.AreEqual(0, context.Response.Headers.ContentSecurityPolicyReportOnly.Count);
    }

    [TestMethod]
    public async Task InvokeAsync_CspReportOnly_UsesCspReportOnlyHeader()
    {
        var options = new CspPolicyOptions { Enabled = true, ReportOnly = true };
        var middleware = this.CreateMiddleware(isDevelopment: false, cspOptions: options);
        var context = await this.InvokeAndFireCallbacks(middleware, "/some-page");

        Assert.IsGreaterThan(0, context.Response.Headers.ContentSecurityPolicyReportOnly.Count);
        Assert.AreEqual(0, context.Response.Headers.ContentSecurityPolicy.Count);
    }

    [TestMethod]
    public async Task InvokeAsync_AuthEndpoint_AddsCacheControlHeaders()
    {
        var middleware = this.CreateMiddleware(isDevelopment: false);
        var context = await this.InvokeAndFireCallbacks(middleware, "/api/auth/login");

        Assert.Contains("no-store", context.Response.Headers.CacheControl.ToString());
        Assert.AreEqual("no-cache", context.Response.Headers.Pragma.ToString());
        Assert.AreEqual("0", context.Response.Headers.Expires.ToString());
    }

    [TestMethod]
    public async Task InvokeAsync_ApiEndpoint_AddsCacheControlNoStore()
    {
        var middleware = this.CreateMiddleware(isDevelopment: false);
        var context = await this.InvokeAndFireCallbacks(middleware, "/api/task-items/list");

        Assert.Contains("no-store", context.Response.Headers.CacheControl.ToString());
    }

    [TestMethod]
    public async Task InvokeAsync_NonApiEndpoint_DoesNotAddCacheControlByDefault()
    {
        var middleware = this.CreateMiddleware(isDevelopment: false);
        var context = await this.InvokeAndFireCallbacks(middleware, "/some-page");

        Assert.DoesNotContain("no-store", context.Response.Headers.CacheControl.ToString());
    }

    [TestMethod]
    public async Task InvokeAsync_WithRemoveServerHeader_RemovesServerHeader()
    {
        var headersOptions = new SecurityHeadersPolicyOptions { RemoveServerHeader = true };
        var middleware = this.CreateMiddleware(isDevelopment: false, headersOptions: headersOptions);
        var context = await this.InvokeAndFireCallbacks(middleware, "/some-page", ctx =>
        {
            ctx.Response.Headers.Server = "Kestrel";
        });

        Assert.IsFalse(context.Response.Headers.ContainsKey("Server"));
    }

    [TestMethod]
    public async Task InvokeAsync_WithRemoveXPoweredByHeader_RemovesXPoweredByHeader()
    {
        var headersOptions = new SecurityHeadersPolicyOptions { RemoveXPoweredByHeader = true };
        var middleware = this.CreateMiddleware(isDevelopment: false, headersOptions: headersOptions);
        var context = await this.InvokeAndFireCallbacks(middleware, "/some-page", ctx =>
        {
            ctx.Response.Headers.XPoweredBy = "ASP.NET";
        });

        Assert.IsFalse(context.Response.Headers.ContainsKey("X-Powered-By"));
    }

    [TestMethod]
    public async Task InvokeAsync_WithHstsEnabled_AddsHstsHeader_InProduction()
    {
        var headersOptions = new SecurityHeadersPolicyOptions
        {
            EnableHsts = true,
            HstsMaxAgeSeconds = 31536000,
            HstsIncludeSubDomains = true,
            HstsPreload = true,
        };
        var middleware = this.CreateMiddleware(isDevelopment: false, headersOptions: headersOptions);
        var context = await this.InvokeAndFireCallbacks(middleware, "/some-page");

        var hstsValue = context.Response.Headers.StrictTransportSecurity.ToString();
        Assert.Contains("max-age=31536000", hstsValue);
        Assert.Contains("includeSubDomains", hstsValue);
        Assert.Contains("preload", hstsValue);
    }

    [TestMethod]
    public async Task InvokeAsync_WithHstsEnabled_InDevelopment_DoesNotAddHsts_ByDefault()
    {
        var headersOptions = new SecurityHeadersPolicyOptions
        {
            EnableHsts = true,
            EnableHstsInDevelopment = false,
        };
        var middleware = this.CreateMiddleware(isDevelopment: true, headersOptions: headersOptions);
        var context = await this.InvokeAndFireCallbacks(middleware, "/some-page");

        Assert.AreEqual(0, context.Response.Headers.StrictTransportSecurity.Count);
    }

    [TestMethod]
    public async Task InvokeAsync_WithHstsEnabled_InDevelopment_AddHsts_WhenConfigured()
    {
        var headersOptions = new SecurityHeadersPolicyOptions
        {
            EnableHsts = true,
            EnableHstsInDevelopment = true,
            HstsMaxAgeSeconds = 3600,
            HstsIncludeSubDomains = false,
            HstsPreload = false,
        };
        var middleware = this.CreateMiddleware(isDevelopment: true, headersOptions: headersOptions);
        var context = await this.InvokeAndFireCallbacks(middleware, "/some-page");

        var hstsValue = context.Response.Headers.StrictTransportSecurity.ToString();
        Assert.AreEqual("max-age=3600", hstsValue);
    }

    [TestMethod]
    public async Task InvokeAsync_WithHstsDisabled_DoesNotAddHsts()
    {
        var headersOptions = new SecurityHeadersPolicyOptions { EnableHsts = false };
        var middleware = this.CreateMiddleware(isDevelopment: false, headersOptions: headersOptions);
        var context = await this.InvokeAndFireCallbacks(middleware, "/some-page");

        Assert.AreEqual(0, context.Response.Headers.StrictTransportSecurity.Count);
    }

    [TestMethod]
    public async Task InvokeAsync_AddsXXSSProtectionHeader()
    {
        var middleware = this.CreateMiddleware(isDevelopment: false);
        var context = await this.InvokeAndFireCallbacks(middleware, "/some-page");

        Assert.IsGreaterThan(0, context.Response.Headers.XXSSProtection.Count);
    }

    private async Task<HttpContext> InvokeAndFireCallbacks(
        SecurityHeadersMiddleware middleware,
        string path,
        Action<HttpContext>? configureContext = null)
    {
        var context = new DefaultHttpContext();
        context.Request.Path = path;

        // Wrap the default response feature to capture and fire OnStarting callbacks
        var feature = new CallbackCapturingResponseFeature(context.Features.Get<IHttpResponseFeature>()!);
        context.Features.Set<IHttpResponseFeature>(feature);

        configureContext?.Invoke(context);

        await middleware.InvokeAsync(context, this.mockNonceService.Object);
        await feature.FireOnStartingCallbacksAsync();

        return context;
    }

    private SecurityHeadersMiddleware CreateMiddleware(
        bool isDevelopment,
        SecurityHeadersPolicyOptions? headersOptions = null,
        CspPolicyOptions? cspOptions = null)
    {
        Task Next(HttpContext context)
        {
            this.nextDelegateCalled = true;
            return Task.CompletedTask;
        }

        var mockEnvironment = new Mock<IHostEnvironment>();
        mockEnvironment.Setup(e => e.EnvironmentName)
            .Returns(isDevelopment ? "Development" : "Production");

        return new SecurityHeadersMiddleware(
            Next,
            mockEnvironment.Object,
            headersOptions ?? new SecurityHeadersPolicyOptions(),
            cspOptions ?? new CspPolicyOptions { Enabled = true, ReportOnly = false });
    }

    /// <summary>
    /// Wraps the default <see cref="IHttpResponseFeature"/> to capture OnStarting callbacks
    /// so they can be invoked manually in unit tests.
    /// </summary>
    private sealed class CallbackCapturingResponseFeature(IHttpResponseFeature inner) : IHttpResponseFeature
    {
        private readonly List<(Func<object, Task> Callback, object State)> onStartingCallbacks = [];

        public int StatusCode
        {
            get => inner.StatusCode;
            set => inner.StatusCode = value;
        }

        public string? ReasonPhrase
        {
            get => inner.ReasonPhrase;
            set => inner.ReasonPhrase = value;
        }

        public IHeaderDictionary Headers
        {
            get => inner.Headers;
            set => inner.Headers = value;
        }

#pragma warning disable CS0618 // IHttpResponseFeature.Body is obsolete but required by the interface
        public Stream Body
        {
            get => inner.Body;
            set => inner.Body = value;
        }
#pragma warning restore CS0618

        public bool HasStarted => inner.HasStarted;

        public void OnStarting(Func<object, Task> callback, object state)
        {
            this.onStartingCallbacks.Add((callback, state));
        }

        public void OnCompleted(Func<object, Task> callback, object state)
        {
            inner.OnCompleted(callback, state);
        }

        public async Task FireOnStartingCallbacksAsync()
        {
            // Fire in reverse order (last registered = first executed), matching ASP.NET Core behavior
            for (var i = this.onStartingCallbacks.Count - 1; i >= 0; i--)
            {
                var (callback, state) = this.onStartingCallbacks[i];
                await callback(state);
            }
        }
    }
}
