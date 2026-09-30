namespace Taskly.Web.Test.Infrastructure;

using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Taskly.Web.Demo;
using Taskly.Web.Infrastructure;

/// <summary>What a host asks before sending traffic: alive reads nothing, ready reads the data.</summary>
[TestClass]
public sealed class HealthEndpointTests
{
    [TestMethod]
    public async Task Liveness_SaysTheProcessIsUpWithoutReadingTheData()
    {
        // Arrange
        var store = new CountingStore();
        using var host = await StartAsync(store);
        using var client = host.GetTestClient();

        // Act
        using var response = await client.GetAsync(HealthEndpoints.LivenessPath);

        // Assert
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
        Assert.AreEqual("alive", await PropertyAsync(response, "status"));
        Assert.AreEqual(0, store.Reads);
    }

    [TestMethod]
    public async Task Readiness_SaysTheInstanceCanTakeTraffic()
    {
        // Arrange
        using var host = await StartAsync(new CountingStore());
        using var client = host.GetTestClient();

        // Act
        using var response = await client.GetAsync(HealthEndpoints.ReadinessPath);

        // Assert
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
        Assert.AreEqual("ready", await PropertyAsync(response, "status"));
    }

    /// <summary>The first read builds the dataset, so the probe warms it.</summary>
    [TestMethod]
    public async Task Readiness_ReadsTheDemoDataAndReportsWhatIsThere()
    {
        // Arrange
        var store = new CountingStore();
        using var host = await StartAsync(store);
        using var client = host.GetTestClient();

        // Act
        using var response = await client.GetAsync(HealthEndpoints.ReadinessPath);
        var projects = await PropertyAsync(response, "projects");

        // Assert
        Assert.AreEqual(1, store.Reads);
        Assert.AreEqual("1", projects);
    }

    private static async Task<string?> PropertyAsync(HttpResponseMessage response, string name)
    {
        using var document = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        var property = document.RootElement.GetProperty(name);

        return property.ValueKind == JsonValueKind.String ? property.GetString() : property.ToString();
    }

    private static async Task<IHost> StartAsync(IDemoStore store)
    {
        return await new HostBuilder()
            .ConfigureWebHost(web => web
                .UseTestServer()
                .ConfigureServices(services =>
                {
                    services.AddRouting();
                    services.AddSingleton(store);
                })
                .Configure(app =>
                {
                    app.UseRouting();
                    app.UseEndpoints(endpoints => endpoints.MapTasklyHealth());
                }))
            .StartAsync();
    }

    /// <summary>One project, and a count of how often it was asked for.</summary>
    private sealed class CountingStore : IDemoStore
    {
        private readonly DemoDataset dataset = Seeded();

        public int Reads { get; private set; }

        public DemoDataset Dataset
        {
            get
            {
                this.Reads++;
                return this.dataset;
            }
        }

        private static DemoDataset Seeded()
        {
            var dataset = new DemoDataset();
            dataset.Projects.Add(new ProjectDto { Title = "Demo Project" });

            return dataset;
        }
    }
}
