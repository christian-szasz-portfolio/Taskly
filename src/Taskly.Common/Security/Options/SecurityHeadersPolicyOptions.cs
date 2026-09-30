namespace Taskly.Common.Security.Options;

using Taskly.Common.Security.Defaults;

/// <summary>
/// Configuration options for security headers (HSTS, X-Frame-Options, etc.).
/// </summary>
public sealed class SecurityHeadersPolicyOptions
{
    /// <summary>
    /// The configuration section name.
    /// </summary>
    public const string SectionName = "Security:Headers";

    /// <summary>Gets or sets a value indicating whether to enable HSTS.</summary>
    public bool EnableHsts { get; set; } = SecurityDefaults.SecurityHeaders.EnableHsts;

    /// <summary>Gets or sets a value indicating whether to enable HSTS in development.</summary>
    public bool EnableHstsInDevelopment { get; set; } = SecurityDefaults.SecurityHeaders.EnableHstsInDevelopment;

    /// <summary>Gets or sets the HSTS max age in seconds.</summary>
    public int HstsMaxAgeSeconds { get; set; } = SecurityDefaults.SecurityHeaders.HstsMaxAgeSeconds;

    /// <summary>Gets or sets a value indicating whether HSTS should include subdomains.</summary>
    public bool HstsIncludeSubDomains { get; set; } = SecurityDefaults.SecurityHeaders.HstsIncludeSubDomains;

    /// <summary>Gets or sets a value indicating whether HSTS should include preload directive.</summary>
    public bool HstsPreload { get; set; } = SecurityDefaults.SecurityHeaders.HstsPreload;

    /// <summary>Gets or sets the X-Frame-Options header value.</summary>
    public string XFrameOptions { get; set; } = SecurityDefaults.SecurityHeaders.XFrameOptions;

    /// <summary>Gets or sets the X-Content-Type-Options header value.</summary>
    public string XContentTypeOptions { get; set; } = SecurityDefaults.SecurityHeaders.XContentTypeOptions;

    /// <summary>Gets or sets the X-XSS-Protection header value (legacy browsers).</summary>
    public string XXSSProtection { get; set; } = SecurityDefaults.SecurityHeaders.XXSSProtection;

    /// <summary>Gets or sets the Referrer-Policy header value.</summary>
    public string ReferrerPolicy { get; set; } = SecurityDefaults.SecurityHeaders.ReferrerPolicy;

    /// <summary>Gets or sets the Permissions-Policy header value.</summary>
    public string PermissionsPolicy { get; set; } = SecurityDefaults.SecurityHeaders.PermissionsPolicy;

    /// <summary>Gets or sets the Cross-Origin-Embedder-Policy header value.</summary>
    public string CrossOriginEmbedderPolicy { get; set; } = SecurityDefaults.SecurityHeaders.CrossOriginEmbedderPolicy;

    /// <summary>Gets or sets the Cross-Origin-Opener-Policy header value.</summary>
    public string CrossOriginOpenerPolicy { get; set; } = SecurityDefaults.SecurityHeaders.CrossOriginOpenerPolicy;

    /// <summary>Gets or sets the Cross-Origin-Resource-Policy header value.</summary>
    public string CrossOriginResourcePolicy { get; set; } = SecurityDefaults.SecurityHeaders.CrossOriginResourcePolicy;

    /// <summary>Gets or sets a value indicating whether to remove the Server header.</summary>
    public bool RemoveServerHeader { get; set; } = SecurityDefaults.SecurityHeaders.RemoveServerHeader;

    /// <summary>Gets or sets a value indicating whether to remove the X-Powered-By header.</summary>
    public bool RemoveXPoweredByHeader { get; set; } = SecurityDefaults.SecurityHeaders.RemoveXPoweredByHeader;
}
