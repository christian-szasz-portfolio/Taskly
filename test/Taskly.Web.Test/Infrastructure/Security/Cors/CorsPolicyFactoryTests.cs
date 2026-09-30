namespace Taskly.Web.Test.Infrastructure.Security.Cors;

using System.Linq;
using Microsoft.AspNetCore.Cors.Infrastructure;
using Taskly.Common.Security.Options;
using Taskly.Web.Infrastructure.Security.Cors;

[TestClass]
public sealed class CorsPolicyFactoryTests
{
    [TestMethod]
    public void Configure_NoOriginsConfigured_DeniesEveryOrigin()
    {
        var builder = new CorsPolicyBuilder();
        CorsPolicyFactory.Configure(builder, new CorsPolicyOptions { AllowedOrigins = [] });

        var policy = builder.Build();

        Assert.IsFalse(policy.IsOriginAllowed("https://example.com"));
        Assert.IsFalse(policy.IsOriginAllowed("https://evil.example"));
    }

    [TestMethod]
    public void Configure_ConfiguredOrigin_AllowsOnlyThatOrigin()
    {
        var builder = new CorsPolicyBuilder();
        CorsPolicyFactory.Configure(
            builder,
            new CorsPolicyOptions
            {
                AllowedOrigins = ["https://taskly.example"],
                AllowedMethods = ["GET"],
                AllowedHeaders = ["Content-Type"],
            });

        var policy = builder.Build();

        Assert.IsTrue(policy.IsOriginAllowed("https://taskly.example"));
        Assert.IsFalse(policy.IsOriginAllowed("https://evil.example"));
        CollectionAssert.Contains(policy.Methods.ToList(), "GET");
        CollectionAssert.Contains(policy.Headers.ToList(), "Content-Type");
    }
}
