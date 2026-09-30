namespace Taskly.Common.Security.Defaults;

/// <summary>
/// Default values for security configuration.
/// These values are used when not explicitly configured.
/// </summary>
public static class SecurityDefaults
{
    /// <summary>CORS defaults.</summary>
    public static class Cors
    {
        /// <summary>Default preflight cache duration in seconds.</summary>
        public const int PreflightMaxAgeSeconds = 600;

        /// <summary>Whether to allow credentials by default.</summary>
        public const bool AllowCredentials = true;

        /// <summary>Whether to validate origins strictly by default.</summary>
        public const bool StrictOriginValidation = true;

        /// <summary>Whether to allow any origin in development when no origins are configured.</summary>
        public const bool AllowAnyOriginInDevelopment = true;

        /// <summary>Default allowed HTTP methods.</summary>
        public static readonly string[] AllowedMethods = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"];

        /// <summary>Default allowed headers.</summary>
        public static readonly string[] AllowedHeaders = ["Content-Type", "Authorization", "X-Requested-With", "X-XSRF-TOKEN"];

        /// <summary>Default exposed headers.</summary>
        public static readonly string[] ExposedHeaders = ["X-Pagination", "X-Request-Id"];
    }

    /// <summary>Content Security Policy defaults.</summary>
    public static class Csp
    {
        /// <summary>Whether CSP is enabled by default.</summary>
        public const bool Enabled = true;

        /// <summary>Whether to use report-only mode by default.</summary>
        public const bool ReportOnly = false;

        /// <summary>Whether to allow inline styles by default.</summary>
        public const bool AllowInlineStyles = true;

        /// <summary>Whether to use strict-dynamic by default.</summary>
        public const bool UseStrictDynamic = false;

        /// <summary>Whether to use nonce-based CSP by default.</summary>
        public const bool UseNonce = true;

        /// <summary>Default default-src directive.</summary>
        public const string DefaultSrc = "'self'";

        /// <summary>Default frame-ancestors directive.</summary>
        public const string FrameAncestors = "'none'";

        /// <summary>Default form-action directive.</summary>
        public const string FormAction = "'self'";

        /// <summary>Default base-uri directive.</summary>
        public const string BaseUri = "'self'";

        /// <summary>Whether to upgrade insecure requests by default.</summary>
        public const bool UpgradeInsecureRequests = true;
    }

    /// <summary>Security headers defaults.</summary>
    public static class SecurityHeaders
    {
        /// <summary>Whether HSTS is enabled by default.</summary>
        public const bool EnableHsts = true;

        /// <summary>Whether HSTS is enabled in development by default.</summary>
        public const bool EnableHstsInDevelopment = false;

        /// <summary>Default HSTS max age in seconds (1 year).</summary>
        public const int HstsMaxAgeSeconds = 31536000;

        /// <summary>Whether HSTS includes subdomains by default.</summary>
        public const bool HstsIncludeSubDomains = true;

        /// <summary>Whether HSTS includes preload by default.</summary>
        public const bool HstsPreload = true;

        /// <summary>Default X-Frame-Options header value.</summary>
        public const string XFrameOptions = "DENY";

        /// <summary>Default X-Content-Type-Options header value.</summary>
        public const string XContentTypeOptions = "nosniff";

        /// <summary>Default X-XSS-Protection header value.</summary>
        public const string XXSSProtection = "1; mode=block";

        /// <summary>Default Referrer-Policy header value.</summary>
        public const string ReferrerPolicy = "strict-origin-when-cross-origin";

        /// <summary>Default Permissions-Policy header value (strict anti-tracking).</summary>
        /// <remarks>Chrome rejects battery, ambient-light-sensor, document-domain, speaker-selection and web-share as unrecognized, so naming them only logs a warning on every page.</remarks>
        public const string PermissionsPolicy = "accelerometer=(), autoplay=(), bluetooth=(), camera=(), clipboard-read=(), display-capture=(), encrypted-media=(), fullscreen=(self), geolocation=(), gyroscope=(), hid=(), idle-detection=(), interest-cohort=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(self), publickey-credentials-get=(self), screen-wake-lock=(), serial=(), sync-xhr=(), usb=(), xr-spatial-tracking=()";

        /// <summary>Default Cross-Origin-Embedder-Policy header value.</summary>
        public const string CrossOriginEmbedderPolicy = "require-corp";

        /// <summary>Default Cross-Origin-Opener-Policy header value.</summary>
        public const string CrossOriginOpenerPolicy = "same-origin";

        /// <summary>Default Cross-Origin-Resource-Policy header value.</summary>
        public const string CrossOriginResourcePolicy = "same-origin";

        /// <summary>Whether to remove Server header by default.</summary>
        public const bool RemoveServerHeader = true;

        /// <summary>Whether to remove X-Powered-By header by default.</summary>
        public const bool RemoveXPoweredByHeader = true;
    }
}
