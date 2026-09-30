namespace Taskly.Web.Infrastructure;

using System.Text;
using System.Text.RegularExpressions;
using Taskly.Web.Infrastructure.Security.Headers;

/// <summary>
/// Serves the SPA page with the request's CSP nonce on the inline scripts the Angular build
/// emits, so the policy in the header and the page it guards agree.
/// </summary>
public sealed partial class IndexHtmlNonceWriter
{
    private readonly string template;

    /// <summary>Initializes a new instance of the <see cref="IndexHtmlNonceWriter"/> class, reading the page once.</summary>
    public IndexHtmlNonceWriter(string indexPath)
    {
        ArgumentNullException.ThrowIfNull(indexPath);

        this.template = File.Exists(indexPath) ? File.ReadAllText(indexPath, Encoding.UTF8) : string.Empty;
    }

    /// <summary>Gets a value indicating whether a page was found to serve.</summary>
    public bool HasTemplate => this.template.Length > 0;

    /// <summary>Writes the page, nonced, and never cached.</summary>
    public async Task WriteAsync(HttpContext context)
    {
        ArgumentNullException.ThrowIfNull(context);

        var nonce = context.Items[SecurityHeadersMiddleware.NonceItemKey] as string ?? string.Empty;
        var html = InlineScript().Replace(this.template, $"<script nonce=\"{nonce}\"");

        var headers = context.Response.Headers;
        headers.CacheControl = "no-cache, no-store, must-revalidate";
        headers.Pragma = "no-cache";
        headers.Expires = "0";

        context.Response.ContentType = "text/html; charset=utf-8";
        await context.Response.WriteAsync(html, Encoding.UTF8, context.RequestAborted);
    }

    /// <summary>A script tag with no src: the only kind a nonce is needed for.</summary>
    [GeneratedRegex("<script(?![^>]*\\ssrc=)", RegexOptions.IgnoreCase)]
    private static partial Regex InlineScript();
}
