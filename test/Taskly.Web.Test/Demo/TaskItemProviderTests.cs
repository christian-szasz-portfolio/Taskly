namespace Taskly.Web.Test.Demo;

using Moq;
using Taskly.Web.Demo;

[TestClass]
public sealed class TaskItemProviderTests
{
    [TestMethod]
    public void GetAll_ReturnsItemsFromTheStore()
    {
        var dataset = DatasetWith(out var first, out _);
        var sut = new TaskItemProvider(StoreReturning(dataset));

        var result = sut.GetAll();

        Assert.HasCount(2, result);
        Assert.AreSame(first, result[0]);
    }

    [TestMethod]
    public void GetById_ReturnsMatchingItem()
    {
        var dataset = DatasetWith(out _, out var second);
        var sut = new TaskItemProvider(StoreReturning(dataset));

        var result = sut.GetById(second.Id);

        Assert.AreSame(second, result);
    }

    [TestMethod]
    public void GetById_ReturnsNull_WhenMissing()
    {
        var dataset = DatasetWith(out _, out _);
        var sut = new TaskItemProvider(StoreReturning(dataset));

        Assert.IsNull(sut.GetById(Guid.NewGuid()));
    }

    private static DemoDataset DatasetWith(out TaskItemDto first, out TaskItemDto second)
    {
        first = new TaskItemDto { Id = Guid.NewGuid(), Title = "First" };
        second = new TaskItemDto { Id = Guid.NewGuid(), Title = "Second" };
        var dataset = new DemoDataset();
        dataset.TaskItems.AddRange([first, second]);
        return dataset;
    }

    private static IDemoStore StoreReturning(DemoDataset dataset)
    {
        var store = new Mock<IDemoStore>();
        store.SetupGet(s => s.Dataset).Returns(dataset);
        return store.Object;
    }
}
