namespace Taskly.Web.Test.Infrastructure;

using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Taskly.Web.Infrastructure;

[TestClass]
public sealed class ApiExceptionHandlerTests
{
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

    private readonly ApiExceptionHandler sut = new();

    public required TestContext TestContext { get; init; }

    [TestMethod]
    public async Task TryHandleAsync_ReturnsFalse_ForNonApiRequest()
    {
        // Arrange
        var context = CreateHttpContext("/some-page");

        // Act
        var handled = await this.sut.TryHandleAsync(context, new Exception("test"), this.TestContext.CancellationToken);

        // Assert
        Assert.IsFalse(handled);
    }

    [TestMethod]
    public async Task TryHandleAsync_ReturnsTrue_ForApiRequest()
    {
        // Arrange
        var context = CreateHttpContext("/api/task-items/list");

        // Act
        var handled = await this.sut.TryHandleAsync(context, new Exception("test"), this.TestContext.CancellationToken);

        // Assert
        Assert.IsTrue(handled);
    }

    [TestMethod]
    public async Task TryHandleAsync_Returns500_ForGenericException()
    {
        // Arrange
        var context = CreateHttpContext("/api/test");

        // Act
        await this.sut.TryHandleAsync(context, new Exception("boom"), this.TestContext.CancellationToken);

        // Assert
        Assert.AreEqual(500, context.Response.StatusCode);
        var problem = await ReadProblemDetails(context);
        Assert.AreEqual("Internal Server Error", problem.Title);
    }

    [TestMethod]
    public async Task TryHandleAsync_Returns400_ForArgumentException()
    {
        // Arrange
        var context = CreateHttpContext("/api/test");

        // Act
        await this.sut.TryHandleAsync(context, new ArgumentException("bad arg"), this.TestContext.CancellationToken);

        // Assert
        Assert.AreEqual(400, context.Response.StatusCode);
        var problem = await ReadProblemDetails(context);
        Assert.AreEqual("Bad Request", problem.Title);
    }

    [TestMethod]
    public async Task TryHandleAsync_Returns403_ForUnauthorizedAccessException()
    {
        // Arrange
        var context = CreateHttpContext("/api/test");

        // Act
        await this.sut.TryHandleAsync(context, new UnauthorizedAccessException(), this.TestContext.CancellationToken);

        // Assert
        Assert.AreEqual(403, context.Response.StatusCode);
    }

    [TestMethod]
    public async Task TryHandleAsync_Returns409_ForInvalidOperationException()
    {
        // Arrange
        var context = CreateHttpContext("/api/test");

        // Act
        await this.sut.TryHandleAsync(context, new InvalidOperationException("conflict"), this.TestContext.CancellationToken);

        // Assert
        Assert.AreEqual(409, context.Response.StatusCode);
        var problem = await ReadProblemDetails(context);
        Assert.AreEqual("Conflict", problem.Title);
    }

    [TestMethod]
    public async Task TryHandleAsync_Returns504_ForTimeoutException()
    {
        // Arrange
        var context = CreateHttpContext("/api/test");

        // Act
        await this.sut.TryHandleAsync(context, new TimeoutException(), this.TestContext.CancellationToken);

        // Assert
        Assert.AreEqual(504, context.Response.StatusCode);
        var problem = await ReadProblemDetails(context);
        Assert.AreEqual("Gateway Timeout", problem.Title);
    }

    [TestMethod]
    public async Task TryHandleAsync_IncludesTraceId_InResponse()
    {
        // Arrange
        var context = CreateHttpContext("/api/test");
        context.TraceIdentifier = "trace-abc-123";

        // Act
        await this.sut.TryHandleAsync(context, new Exception("test"), this.TestContext.CancellationToken);

        // Assert
        var problem = await ReadProblemDetails(context);
        Assert.IsTrue(problem.Extensions.ContainsKey("traceId"));
        Assert.AreEqual("trace-abc-123", problem.Extensions["traceId"]?.ToString());
    }

    [TestMethod]
    public async Task TryHandleAsync_SetsContentType_ToProblemJson()
    {
        // Arrange
        var context = CreateHttpContext("/api/test");

        // Act
        await this.sut.TryHandleAsync(context, new Exception("test"), this.TestContext.CancellationToken);

        // Assert
        Assert.IsNotNull(context.Response.ContentType);
        Assert.Contains("json", context.Response.ContentType);
    }

    private static DefaultHttpContext CreateHttpContext(string path)
    {
        var context = new DefaultHttpContext();
        context.Request.Path = path;
        context.Request.Method = "GET";
        context.Response.Body = new MemoryStream();
        return context;
    }

    private static async Task<ProblemDetails> ReadProblemDetails(HttpContext context)
    {
        context.Response.Body.Position = 0;
        var result = await JsonSerializer.DeserializeAsync<ProblemDetails>(
            context.Response.Body,
            JsonOptions);
        return result!;
    }
}
