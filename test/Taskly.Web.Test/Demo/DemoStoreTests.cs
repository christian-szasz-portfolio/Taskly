namespace Taskly.Web.Test.Demo;

using Microsoft.Extensions.Caching.Memory;
using Taskly.Web.Demo;

[TestClass]
public sealed class DemoStoreTests
{
    [TestMethod]
    public void Dataset_ReturnsABuiltDataset()
    {
        var sut = CreateStore();

        var dataset = sut.Dataset;

        Assert.IsNotNull(dataset);
        Assert.IsGreaterThan(0, dataset.TaskItems.Count);
    }

    [TestMethod]
    public void Dataset_IsCached_ReturnsSameInstanceAcrossReads()
    {
        var sut = CreateStore();

        var first = sut.Dataset;
        var second = sut.Dataset;

        // GetOrCreate must serve the cached instance, not rebuild on every read.
        Assert.AreSame(first, second);
    }

    private static DemoStore CreateStore() =>
        new(new MemoryCache(new MemoryCacheOptions()), new DemoSeedManager());
}
