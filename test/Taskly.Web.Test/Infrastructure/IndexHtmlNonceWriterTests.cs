namespace Taskly.Web.Test.Infrastructure;

using System.Text;
using Microsoft.AspNetCore.Http;
using Taskly.Web.Infrastructure;
using Taskly.Web.Infrastructure.Security.Headers;

/// <summary>
/// The page and the policy have to agree: the Angular build emits an inline script, and the
/// header naming a nonce blocks it unless the same nonce is on the tag.
/// </summary>
[TestClass]
public sealed class IndexHtmlNonceWriterTests
{
    private const string Nonce = "n0nc3-value";

    private string? pagePath;

    [TestCleanup]
    public void Cleanup()
    {
        if (this.pagePath is not null && File.Exists(this.pagePath))
        {
            File.Delete(this.pagePath);
        }
    }

    [TestMethod]
    public async Task WriteAsync_PutsTheRequestNonceOnAnInlineScript()
    {
        // Arrange
        var writer = this.WriterFor("<html><body><script>console.log(1);</script></body></html>");
        var context = ContextWith(Nonce);

        // Act
        await writer.WriteAsync(context);

        // Assert
        StringAssert.Contains(await BodyOf(context), $"<script nonce=\"{Nonce}\">");
    }

    /// <summary>A script with a src is fetched, and the policy already allows this origin.</summary>
    [TestMethod]
    public async Task WriteAsync_LeavesAScriptWithASourceAlone()
    {
        // Arrange
        var writer = this.WriterFor("<html><body><script src=\"/assets/app.js\"></script></body></html>");
        var context = ContextWith(Nonce);

        // Act
        await writer.WriteAsync(context);

        // Assert
        StringAssert.Contains(await BodyOf(context), "<script src=\"/assets/app.js\">");
    }

    [TestMethod]
    public async Task WriteAsync_TellsTheBrowserNotToKeepThePage()
    {
        // Arrange: a stale page would carry a nonce the next response's header does not name.
        var writer = this.WriterFor("<html><body><script>console.log(1);</script></body></html>");
        var context = ContextWith(Nonce);

        // Act
        await writer.WriteAsync(context);

        // Assert
        StringAssert.Contains(context.Response.Headers.CacheControl.ToString(), "no-store");
    }

    [TestMethod]
    public void HasTemplate_IsFalseWhenTheClientWasNeverBuilt()
    {
        // Act
        var writer = new IndexHtmlNonceWriter(Path.Combine(Path.GetTempPath(), "taskly-missing-index.html"));

        // Assert
        Assert.IsFalse(writer.HasTemplate);
    }

    private static DefaultHttpContext ContextWith(string nonce)
    {
        var context = new DefaultHttpContext();
        context.Items[SecurityHeadersMiddleware.NonceItemKey] = nonce;
        context.Response.Body = new MemoryStream();

        return context;
    }

    private static async Task<string> BodyOf(HttpContext context)
    {
        context.Response.Body.Position = 0;
        using var reader = new StreamReader(context.Response.Body, Encoding.UTF8);

        return await reader.ReadToEndAsync();
    }

    private IndexHtmlNonceWriter WriterFor(string html)
    {
        this.pagePath = Path.Combine(Path.GetTempPath(), $"taskly-index-{Guid.NewGuid():N}.html");
        File.WriteAllText(this.pagePath, html, Encoding.UTF8);

        return new IndexHtmlNonceWriter(this.pagePath);
    }
}
