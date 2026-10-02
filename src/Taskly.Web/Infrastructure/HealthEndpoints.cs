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

    /// <summary>The configuration key listing the sites that may wake this instance.</summary>
    public const string WakeOriginsKey = "Health:WakeOrigins";

    /// <summary>Maps both probes with no rate limit; only the wake origins may read liveness.</summary>
    public static IEndpointRouteBuilder MapTasklyHealth(this IEndpointRouteBuilder endpoints, string[] wakeOrigins)
    {
        ArgumentNullException.ThrowIfNull(endpoints);
        ArgumentNullException.ThrowIfNull(wakeOrigins);

        // Touches nothing: a slow first build is not a dead process.
        endpoints.MapGet(LivenessPath, () => Results.Ok(new { status = "alive" }))
            .RequireCors(policy => policy.WithOrigins(wakeOrigins).WithMethods("GET"));

        // Reads the demo data, which both answers the question and warms the cache.
        endpoints.MapGet(ReadinessPath, (IDemoStore store) => Results.Ok(new
        {
            status = "ready",
            projects = store.Dataset.Projects.Count,
        }));

        return endpoints;
    }
}
