namespace Taskly.Web.Infrastructure;

using System.Net;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Serilog;

/// <summary>
/// Global exception handler for API requests.
/// Returns structured ProblemDetails JSON instead of HTML error pages,
/// ensuring the Angular frontend always receives a parseable error response.
/// </summary>
public sealed class ApiExceptionHandler : IExceptionHandler
{
    /// <inheritdoc/>
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        // Only handle API requests (let MVC/Razor pages fall through to the default handler)
        if (!IsApiRequest(httpContext))
        {
            return false;
        }

        Log.Error(
            exception,
            "Unhandled exception on {Method} {Path}",
            httpContext.Request.Method,
            httpContext.Request.Path);

        var statusCode = MapExceptionToStatusCode(exception);

        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title = GetTitleForStatusCode(statusCode),
            Detail = "An unexpected error occurred. Please try again. If the problem persists, contact support.",
            Instance = httpContext.Request.Path,
        };

        // Add a correlation ID so the admin can look up the failure in logs
        if (httpContext.TraceIdentifier is { Length: > 0 })
        {
            problemDetails.Extensions["traceId"] = httpContext.TraceIdentifier;
        }

        httpContext.Response.StatusCode = statusCode;
        httpContext.Response.ContentType = "application/problem+json";

        await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);
        return true;
    }

    private static bool IsApiRequest(HttpContext context)
    {
        var path = context.Request.Path.Value;
        return path is not null && path.StartsWith("/api/", StringComparison.OrdinalIgnoreCase);
    }

    private static int MapExceptionToStatusCode(Exception exception)
    {
        return exception switch
        {
            OperationCanceledException => StatusCodes.Status499ClientClosedRequest,
            UnauthorizedAccessException => StatusCodes.Status403Forbidden,
            InvalidOperationException => StatusCodes.Status409Conflict,
            ArgumentException => StatusCodes.Status400BadRequest,
            TimeoutException => StatusCodes.Status504GatewayTimeout,
            _ => StatusCodes.Status500InternalServerError,
        };
    }

    private static string GetTitleForStatusCode(int statusCode)
    {
        return statusCode switch
        {
            StatusCodes.Status400BadRequest => "Bad Request",
            StatusCodes.Status403Forbidden => "Forbidden",
            StatusCodes.Status409Conflict => "Conflict",
            StatusCodes.Status499ClientClosedRequest => "Client Closed Request",
            StatusCodes.Status504GatewayTimeout => "Gateway Timeout",
            _ => "Internal Server Error",
        };
    }
}
