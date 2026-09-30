namespace Taskly.Web.Infrastructure.Security.Cors;

using Microsoft.AspNetCore.Cors.Infrastructure;
using Taskly.Common.Security.Options;

/// <summary>Builds the frontend CORS policy from configuration, closed when no origin is set.</summary>
public static class CorsPolicyFactory
{
    /// <summary>No configured origin denies every cross-origin caller.</summary>
    public static void Configure(CorsPolicyBuilder policy, CorsPolicyOptions options)
    {
        if (options.AllowedOrigins.Length == 0)
        {
            policy.SetIsOriginAllowed(_ => false);
            return;
        }

        policy
            .WithOrigins(options.AllowedOrigins)
            .WithMethods(options.AllowedMethods)
            .WithHeaders(options.AllowedHeaders);
    }
}
