namespace Taskly.Common.Security.Options;

using Taskly.Common.Security.Defaults;

/// <summary>
/// Configuration options for CORS (Cross-Origin Resource Sharing).
/// </summary>
public sealed class CorsPolicyOptions
{
    /// <summary>
    /// The configuration section name.
    /// </summary>
    public const string SectionName = "Security:Cors";

    /// <summary>Gets or sets the allowed origins for the frontend policy.</summary>
    public string[] AllowedOrigins { get; set; } = [];

    /// <summary>Gets or sets the allowed HTTP methods.</summary>
    public string[] AllowedMethods { get; set; } = SecurityDefaults.Cors.AllowedMethods;

    /// <summary>Gets or sets the allowed headers.</summary>
    public string[] AllowedHeaders { get; set; } = SecurityDefaults.Cors.AllowedHeaders;

    /// <summary>Gets or sets the headers exposed to the client.</summary>
    public string[] ExposedHeaders { get; set; } = SecurityDefaults.Cors.ExposedHeaders;

    /// <summary>Gets or sets the preflight cache duration in seconds.</summary>
    public int PreflightMaxAgeSeconds { get; set; } = SecurityDefaults.Cors.PreflightMaxAgeSeconds;

    /// <summary>Gets or sets a value indicating whether to allow credentials.</summary>
    public bool AllowCredentials { get; set; } = SecurityDefaults.Cors.AllowCredentials;

    /// <summary>Gets or sets a value indicating whether to validate origins strictly (no wildcards in production).</summary>
    public bool StrictOriginValidation { get; set; } = SecurityDefaults.Cors.StrictOriginValidation;

    /// <summary>Gets or sets a value indicating whether to allow any origin in development when no origins are configured.</summary>
    public bool AllowAnyOriginInDevelopment { get; set; } = SecurityDefaults.Cors.AllowAnyOriginInDevelopment;
}
