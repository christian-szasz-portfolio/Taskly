namespace Taskly.Web.Infrastructure.Security.Csp;

using Taskly.Common.Security.Options;

/// <summary>
/// Builder for constructing Content Security Policy headers.
/// </summary>
/// <remarks>
/// Initializes a new instance of the <see cref="ContentSecurityPolicyBuilder"/> class.
/// </remarks>
/// <param name="nonce">The nonce for script execution.</param>
/// <param name="isDevelopment">Whether running in development mode.</param>
/// <param name="options">CSP configuration options.</param>
public sealed class ContentSecurityPolicyBuilder(string nonce, bool isDevelopment, CspPolicyOptions? options = null)
{
    private readonly List<string> directives = [];
    private readonly string nonce = nonce;
    private readonly bool isDevelopment = isDevelopment;
    private readonly CspPolicyOptions options = options ?? new CspPolicyOptions();

    /// <summary>
    /// Builds the complete CSP header value.
    /// </summary>
    /// <returns>The CSP header value.</returns>
    public string Build()
    {
        this.AddDefaultSrc();
        this.AddScriptSrc();
        this.AddStyleSrc();
        this.AddImageSrc();
        this.AddFontSrc();
        this.AddConnectSrc();
        this.AddFrameAncestors();
        this.AddFormAction();
        this.AddBaseUri();
        this.AddObjectSrc();
        this.AddMediaSrc();
        this.AddWorkerSrc();
        this.AddManifestSrc();
        this.AddUpgradeInsecureRequests();
        this.AddReportUri();

        return string.Join("; ", this.directives);
    }

    private void AddDefaultSrc()
    {
        this.directives.Add("default-src 'self'");
    }

    private void AddScriptSrc()
    {
        var sources = new List<string> { "'self'", $"'nonce-{this.nonce}'" };

        if (this.isDevelopment)
        {
            // Allow eval for hot reload in development
            sources.Add("'unsafe-eval'");
        }

        if (this.options.UseStrictDynamic)
        {
            sources.Add("'strict-dynamic'");
        }

        sources.AddRange(this.options.AdditionalScriptSources);

        this.directives.Add($"script-src {string.Join(" ", sources)}");
    }

    private void AddStyleSrc()
    {
        var sources = new List<string> { "'self'", "https://fonts.googleapis.com" };

        if (this.options.AllowInlineStyles)
        {
            // Required for Angular Material and many CSS-in-JS solutions
            sources.Add("'unsafe-inline'");
        }
        else
        {
            // Use nonce for inline styles if not allowing unsafe-inline
            sources.Add($"'nonce-{this.nonce}'");
        }

        sources.AddRange(this.options.AdditionalStyleSources);

        this.directives.Add($"style-src {string.Join(" ", sources)}");
    }

    private void AddImageSrc()
    {
        var sources = new List<string> { "'self'", "data:", "blob:", "https:" };
        sources.AddRange(this.options.AdditionalImageSources);
        this.directives.Add($"img-src {string.Join(" ", sources)}");
    }

    private void AddFontSrc()
    {
        // Allow Google Fonts
        this.directives.Add("font-src 'self' data: https://fonts.gstatic.com");
    }

    private void AddConnectSrc()
    {
        var sources = new List<string> { "'self'" };

        if (this.isDevelopment)
        {
            // Allow WebSocket connections for hot reload
            sources.Add("ws:");
            sources.Add("wss:");
        }

        sources.AddRange(this.options.AdditionalConnectSources);

        this.directives.Add($"connect-src {string.Join(" ", sources)}");
    }

    private void AddFrameAncestors()
    {
        // Prevent embedding in frames (clickjacking protection)
        this.directives.Add("frame-ancestors 'none'");
    }

    private void AddFormAction()
    {
        this.directives.Add("form-action 'self'");
    }

    private void AddBaseUri()
    {
        this.directives.Add("base-uri 'self'");
    }

    private void AddObjectSrc()
    {
        // Block plugins like Flash
        this.directives.Add("object-src 'none'");
    }

    private void AddMediaSrc()
    {
        this.directives.Add("media-src 'self'");
    }

    private void AddWorkerSrc()
    {
        this.directives.Add("worker-src 'self' blob:");
    }

    private void AddManifestSrc()
    {
        this.directives.Add("manifest-src 'self'");
    }

    private void AddUpgradeInsecureRequests()
    {
        if (!this.isDevelopment)
        {
            this.directives.Add("upgrade-insecure-requests");
        }
    }

    private void AddReportUri()
    {
        if (!string.IsNullOrEmpty(this.options.ReportUri))
        {
            this.directives.Add($"report-uri {this.options.ReportUri}");
            this.directives.Add($"report-to csp-endpoint");
        }
    }
}
