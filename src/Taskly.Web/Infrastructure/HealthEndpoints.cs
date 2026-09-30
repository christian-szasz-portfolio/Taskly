namespace Taskly.Web.Infrastructure;

using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Taskly.Web.Demo;

/// <summary>The probes a host asks: alive, and ready for traffic.</summary>
public static class HealthEndpoints
{
    /// <summary>Where a platform probe knocks to see the process is up.</summary>
    public const string LivenessPath = "/health";

    /// <summary>Where it knocks to see whether this instance should be sent requests.</summary>
    public const string ReadinessPath = "/health/ready";

    /// <summary>Maps both probes, with no rate-limiting policy.</summary>
    public static IEndpointRouteBuilder MapTasklyHealth(this IEndpointRouteBuilder endpoints)
    {
        ArgumentNullException.ThrowIfNull(endpoints);

        // Touches nothing: a slow first build is not a dead process.
        endpoints.MapGet(LivenessPath, () => Results.Ok(new { status = "alive" }));

        // Reads the demo data, which both answers the question and warms the cache.
        endpoints.MapGet(ReadinessPath, (IDemoStore store) => Results.Ok(new
        {
            status = "ready",
            projects = store.Dataset.Projects.Count,
        }));

        return endpoints;
    }
}
