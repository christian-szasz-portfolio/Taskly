namespace Taskly.Web.Test.Demo;

using Moq;
using Taskly.Web.Demo;

[TestClass]
public sealed class TaskItemManagerTests
{
    [TestMethod]
    public void Create_AssignsId_WhenEmpty_AndInsertsAtFront()
    {
        var dataset = new DemoDataset();
        dataset.TaskItems.Add(new TaskItemDto { Id = Guid.NewGuid(), Title = "Existing" });
        var sut = new TaskItemManager(StoreReturning(dataset));

        var created = sut.Create(new TaskItemDto { Title = "New" });

        Assert.AreNotEqual(Guid.Empty, created.Id);
        Assert.AreSame(created, dataset.TaskItems[0]);
        Assert.HasCount(2, dataset.TaskItems);
    }

    [TestMethod]
    public void Create_KeepsProvidedId()
    {
        var dataset = new DemoDataset();
        var id = Guid.NewGuid();
        var sut = new TaskItemManager(StoreReturning(dataset));

        var created = sut.Create(new TaskItemDto { Id = id, Title = "New" });

        Assert.AreEqual(id, created.Id);
    }

    [TestMethod]
    public void Update_ReplacesExistingItem_PreservingId()
    {
        var id = Guid.NewGuid();
        var dataset = new DemoDataset();
        dataset.TaskItems.Add(new TaskItemDto { Id = id, Title = "Old" });
        var sut = new TaskItemManager(StoreReturning(dataset));

        var updated = sut.Update(id, new TaskItemDto { Title = "Updated" });

        Assert.IsNotNull(updated);
        Assert.AreEqual(id, updated.Id);
        Assert.AreEqual("Updated", dataset.TaskItems[0].Title);
    }

    [TestMethod]
    public void Update_ReturnsNull_WhenMissing()
    {
        var dataset = new DemoDataset();
        var sut = new TaskItemManager(StoreReturning(dataset));

        Assert.IsNull(sut.Update(Guid.NewGuid(), new TaskItemDto { Title = "x" }));
    }

    [TestMethod]
    public void Delete_RemovesItem_AndReturnsTrue()
    {
        var id = Guid.NewGuid();
        var dataset = new DemoDataset();
        dataset.TaskItems.Add(new TaskItemDto { Id = id, Title = "Doomed" });
        var sut = new TaskItemManager(StoreReturning(dataset));

        var removed = sut.Delete(id);

        Assert.IsTrue(removed);
        Assert.IsEmpty(dataset.TaskItems);
    }

    [TestMethod]
    public void Delete_ReturnsFalse_WhenMissing()
    {
        var dataset = new DemoDataset();
        var sut = new TaskItemManager(StoreReturning(dataset));

        Assert.IsFalse(sut.Delete(Guid.NewGuid()));
    }

    private static IDemoStore StoreReturning(DemoDataset dataset)
    {
        var store = new Mock<IDemoStore>();
        store.SetupGet(s => s.Dataset).Returns(dataset);
        return store.Object;
    }
}
