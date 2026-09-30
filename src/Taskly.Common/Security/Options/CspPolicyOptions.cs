namespace Taskly.Common.Security.Options;

using Taskly.Common.Security.Defaults;

/// <summary>
/// Configuration options for Content Security Policy (CSP).
/// </summary>
public sealed class CspPolicyOptions
{
    /// <summary>
    /// The configuration section name.
    /// </summary>
    public const string SectionName = "Security:Csp";

    /// <summary>Gets or sets a value indicating whether CSP is enabled.</summary>
    public bool Enabled { get; set; } = SecurityDefaults.Csp.Enabled;

    /// <summary>Gets or sets a value indicating whether to use report-only mode.</summary>
    public bool ReportOnly { get; set; } = SecurityDefaults.Csp.ReportOnly;

    /// <summary>Gets or sets the CSP report URI.</summary>
    public string? ReportUri { get; set; }

    /// <summary>Gets or sets additional script sources.</summary>
    public string[] AdditionalScriptSources { get; set; } = [];

    /// <summary>Gets or sets additional style sources.</summary>
    public string[] AdditionalStyleSources { get; set; } = [];

    /// <summary>Gets or sets additional connect sources.</summary>
    public string[] AdditionalConnectSources { get; set; } = [];

    /// <summary>Gets or sets additional image sources.</summary>
    public string[] AdditionalImageSources { get; set; } = [];

    /// <summary>Gets or sets additional font sources.</summary>
    public string[] AdditionalFontSources { get; set; } = [];

    /// <summary>Gets or sets additional frame sources.</summary>
    public string[] AdditionalFrameSources { get; set; } = [];

    /// <summary>Gets or sets a value indicating whether to allow inline styles (for Material Design).</summary>
    public bool AllowInlineStyles { get; set; } = SecurityDefaults.Csp.AllowInlineStyles;

    /// <summary>Gets or sets a value indicating whether to use strict-dynamic for scripts.</summary>
    public bool UseStrictDynamic { get; set; } = SecurityDefaults.Csp.UseStrictDynamic;

    /// <summary>Gets or sets a value indicating whether to use nonce-based CSP.</summary>
    public bool UseNonce { get; set; } = SecurityDefaults.Csp.UseNonce;

    /// <summary>Gets or sets the default-src directive value.</summary>
    public string DefaultSrc { get; set; } = SecurityDefaults.Csp.DefaultSrc;

    /// <summary>Gets or sets the frame-ancestors directive value.</summary>
    public string FrameAncestors { get; set; } = SecurityDefaults.Csp.FrameAncestors;

    /// <summary>Gets or sets the form-action directive value.</summary>
    public string FormAction { get; set; } = SecurityDefaults.Csp.FormAction;

    /// <summary>Gets or sets the base-uri directive value.</summary>
    public string BaseUri { get; set; } = SecurityDefaults.Csp.BaseUri;

    /// <summary>Gets or sets a value indicating whether to include upgrade-insecure-requests directive.</summary>
    public bool UpgradeInsecureRequests { get; set; } = SecurityDefaults.Csp.UpgradeInsecureRequests;
}
