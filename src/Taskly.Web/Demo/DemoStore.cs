namespace Taskly.Web.Demo;

using Microsoft.Extensions.Caching.Memory;

/// <summary>
/// Holds the demo dataset in <see cref="IMemoryCache"/> with a 24-hour sliding expiration —
/// the server-side mirror of the client's 24h demo window. No database, no EF.
/// </summary>
public interface IDemoStore
{
    DemoDataset Dataset { get; }
}

public sealed class DemoStore(IMemoryCache cache, DemoSeedManager seeder) : IDemoStore
{
    private const string CacheKey = "demo-dataset";

    public DemoDataset Dataset => cache.GetOrCreate(CacheKey, entry =>
    {
        entry.SlidingExpiration = TimeSpan.FromHours(24);
        return seeder.Build();
    })!;
}
