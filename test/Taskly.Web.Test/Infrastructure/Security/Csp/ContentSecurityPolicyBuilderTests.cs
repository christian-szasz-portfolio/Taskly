namespace Taskly.Web.Test.Infrastructure.Security.Csp;

using Taskly.Common.Security.Options;
using Taskly.Web.Infrastructure.Security.Csp;

[TestClass]
public sealed class ContentSecurityPolicyBuilderTests
{
    [TestMethod]
    public void Build_ContainsDefaultSrc()
    {
        var builder = new ContentSecurityPolicyBuilder("test-nonce", isDevelopment: false);

        var result = builder.Build();

        Assert.Contains("default-src 'self'", result);
    }

    [TestMethod]
    public void Build_ContainsScriptSrcWithNonce()
    {
        var builder = new ContentSecurityPolicyBuilder("my-nonce", isDevelopment: false);

        var result = builder.Build();

        Assert.Contains("script-src", result);
        Assert.Contains("'nonce-my-nonce'", result);
    }

    [TestMethod]
    public void Build_Development_IncludesUnsafeEval()
    {
        var builder = new ContentSecurityPolicyBuilder("nonce", isDevelopment: true);

        var result = builder.Build();

        Assert.Contains("'unsafe-eval'", result);
    }

    [TestMethod]
    public void Build_Production_DoesNotIncludeUnsafeEval()
    {
        var builder = new ContentSecurityPolicyBuilder("nonce", isDevelopment: false);

        var result = builder.Build();

        Assert.DoesNotContain("'unsafe-eval'", result);
    }

    [TestMethod]
    public void Build_WithStrictDynamic_IncludesStrictDynamic()
    {
        var options = new CspPolicyOptions { UseStrictDynamic = true };
        var builder = new ContentSecurityPolicyBuilder("nonce", isDevelopment: false, options);

        var result = builder.Build();

        Assert.Contains("'strict-dynamic'", result);
    }

    [TestMethod]
    public void Build_WithoutStrictDynamic_DoesNotIncludeStrictDynamic()
    {
        var options = new CspPolicyOptions { UseStrictDynamic = false };
        var builder = new ContentSecurityPolicyBuilder("nonce", isDevelopment: false, options);

        var result = builder.Build();

        Assert.DoesNotContain("'strict-dynamic'", result);
    }

    [TestMethod]
    public void Build_WithAdditionalScriptSources_IncludesThem()
    {
        var options = new CspPolicyOptions
        {
            AdditionalScriptSources = ["https://cdn.example.com"],
        };
        var builder = new ContentSecurityPolicyBuilder("nonce", isDevelopment: false, options);

        var result = builder.Build();

        Assert.Contains("https://cdn.example.com", result);
    }

    [TestMethod]
    public void Build_WithAllowInlineStyles_IncludesUnsafeInline()
    {
        var options = new CspPolicyOptions { AllowInlineStyles = true };
        var builder = new ContentSecurityPolicyBuilder("nonce", isDevelopment: false, options);

        var result = builder.Build();

        Assert.Contains("style-src", result);
        Assert.Contains("'unsafe-inline'", result);
    }

    [TestMethod]
    public void Build_WithoutAllowInlineStyles_UsesNonceForStyles()
    {
        var options = new CspPolicyOptions { AllowInlineStyles = false };
        var builder = new ContentSecurityPolicyBuilder("my-nonce", isDevelopment: false, options);

        var result = builder.Build();

        Assert.Contains("style-src", result);
        Assert.IsFalse(result.Contains("style-src") && result.Contains("'unsafe-inline'") && !result.Contains("script-src"));

        // The style-src should use nonce
        var styleSrcPart = result.Split(';')
            .First(d => d.Trim().StartsWith("style-src"));
        Assert.Contains("'nonce-my-nonce'", styleSrcPart);
    }

    [TestMethod]
    public void Build_WithAdditionalStyleSources_IncludesThem()
    {
        var options = new CspPolicyOptions
        {
            AdditionalStyleSources = ["https://styles.example.com"],
        };
        var builder = new ContentSecurityPolicyBuilder("nonce", isDevelopment: false, options);

        var result = builder.Build();

        Assert.Contains("https://styles.example.com", result);
    }

    [TestMethod]
    public void Build_ContainsImageSrc()
    {
        var builder = new ContentSecurityPolicyBuilder("nonce", isDevelopment: false);

        var result = builder.Build();

        Assert.Contains("img-src 'self' data: blob: https:", result);
    }

    [TestMethod]
    public void Build_WithAdditionalImageSources_IncludesThem()
    {
        var options = new CspPolicyOptions
        {
            AdditionalImageSources = ["https://images.example.com"],
        };
        var builder = new ContentSecurityPolicyBuilder("nonce", isDevelopment: false, options);

        var result = builder.Build();

        Assert.Contains("https://images.example.com", result);
    }

    [TestMethod]
    public void Build_ContainsFontSrc()
    {
        var builder = new ContentSecurityPolicyBuilder("nonce", isDevelopment: false);

        var result = builder.Build();

        Assert.Contains("font-src 'self' data: https://fonts.gstatic.com", result);
    }

    [TestMethod]
    public void Build_Development_ConnectSrcIncludesWebSocket()
    {
        var builder = new ContentSecurityPolicyBuilder("nonce", isDevelopment: true);

        var result = builder.Build();

        Assert.Contains("connect-src", result);
        Assert.Contains("ws:", result);
        Assert.Contains("wss:", result);
    }

    [TestMethod]
    public void Build_Production_ConnectSrcExcludesWebSocket()
    {
        var builder = new ContentSecurityPolicyBuilder("nonce", isDevelopment: false);

        var result = builder.Build();

        var connectSrcPart = result.Split(';')
            .First(d => d.Trim().StartsWith("connect-src"));
        Assert.DoesNotContain("ws:", connectSrcPart);
    }

    [TestMethod]
    public void Build_WithAdditionalConnectSources_IncludesThem()
    {
        var options = new CspPolicyOptions
        {
            AdditionalConnectSources = ["https://api.example.com"],
        };
        var builder = new ContentSecurityPolicyBuilder("nonce", isDevelopment: false, options);

        var result = builder.Build();

        Assert.Contains("https://api.example.com", result);
    }

    [TestMethod]
    public void Build_ContainsFrameAncestorsNone()
    {
        var builder = new ContentSecurityPolicyBuilder("nonce", isDevelopment: false);

        var result = builder.Build();

        Assert.Contains("frame-ancestors 'none'", result);
    }

    [TestMethod]
    public void Build_ContainsFormActionSelf()
    {
        var builder = new ContentSecurityPolicyBuilder("nonce", isDevelopment: false);

        var result = builder.Build();

        Assert.Contains("form-action 'self'", result);
    }

    [TestMethod]
    public void Build_ContainsBaseUriSelf()
    {
        var builder = new ContentSecurityPolicyBuilder("nonce", isDevelopment: false);

        var result = builder.Build();

        Assert.Contains("base-uri 'self'", result);
    }

    [TestMethod]
    public void Build_ContainsObjectSrcNone()
    {
        var builder = new ContentSecurityPolicyBuilder("nonce", isDevelopment: false);

        var result = builder.Build();

        Assert.Contains("object-src 'none'", result);
    }

    [TestMethod]
    public void Build_ContainsMediaSrcSelf()
    {
        var builder = new ContentSecurityPolicyBuilder("nonce", isDevelopment: false);

        var result = builder.Build();

        Assert.Contains("media-src 'self'", result);
    }

    [TestMethod]
    public void Build_ContainsWorkerSrc()
    {
        var builder = new ContentSecurityPolicyBuilder("nonce", isDevelopment: false);

        var result = builder.Build();

        Assert.Contains("worker-src 'self' blob:", result);
    }

    [TestMethod]
    public void Build_ContainsManifestSrcSelf()
    {
        var builder = new ContentSecurityPolicyBuilder("nonce", isDevelopment: false);

        var result = builder.Build();

        Assert.Contains("manifest-src 'self'", result);
    }

    [TestMethod]
    public void Build_Production_ContainsUpgradeInsecureRequests()
    {
        var builder = new ContentSecurityPolicyBuilder("nonce", isDevelopment: false);

        var result = builder.Build();

        Assert.Contains("upgrade-insecure-requests", result);
    }

    [TestMethod]
    public void Build_Development_DoesNotContainUpgradeInsecureRequests()
    {
        var builder = new ContentSecurityPolicyBuilder("nonce", isDevelopment: true);

        var result = builder.Build();

        Assert.DoesNotContain("upgrade-insecure-requests", result);
    }

    [TestMethod]
    public void Build_WithReportUri_IncludesReportUriAndReportTo()
    {
        var options = new CspPolicyOptions
        {
            ReportUri = "https://report.example.com/csp",
        };
        var builder = new ContentSecurityPolicyBuilder("nonce", isDevelopment: false, options);

        var result = builder.Build();

        Assert.Contains("report-uri https://report.example.com/csp", result);
        Assert.Contains("report-to csp-endpoint", result);
    }

    [TestMethod]
    public void Build_WithoutReportUri_DoesNotIncludeReportDirectives()
    {
        var options = new CspPolicyOptions { ReportUri = null };
        var builder = new ContentSecurityPolicyBuilder("nonce", isDevelopment: false, options);

        var result = builder.Build();

        Assert.DoesNotContain("report-uri", result);
        Assert.DoesNotContain("report-to", result);
    }

    [TestMethod]
    public void Build_WithEmptyReportUri_DoesNotIncludeReportDirectives()
    {
        var options = new CspPolicyOptions { ReportUri = string.Empty };
        var builder = new ContentSecurityPolicyBuilder("nonce", isDevelopment: false, options);

        var result = builder.Build();

        Assert.DoesNotContain("report-uri", result);
    }

    [TestMethod]
    public void Build_WithNullOptions_UsesDefaults()
    {
        var builder = new ContentSecurityPolicyBuilder("nonce", isDevelopment: false, options: null);

        var result = builder.Build();

        Assert.Contains("default-src 'self'", result);
        Assert.Contains("script-src", result);
    }

    [TestMethod]
    public void Build_DirectivesAreSemicolonSeparated()
    {
        var builder = new ContentSecurityPolicyBuilder("nonce", isDevelopment: false);

        var result = builder.Build();

        var directives = result.Split("; ");
        Assert.IsGreaterThan(10, directives.Length);
    }

    [TestMethod]
    public void Build_ContainsStyleSrcWithGoogleFonts()
    {
        var builder = new ContentSecurityPolicyBuilder("nonce", isDevelopment: false);

        var result = builder.Build();

        var styleSrcPart = result.Split(';')
            .First(d => d.Trim().StartsWith("style-src"));
        Assert.Contains("https://fonts.googleapis.com", styleSrcPart);
    }
}
