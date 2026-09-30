namespace Taskly.Web.Test.Demo;

using Moq;
using Taskly.Web.Demo;

[TestClass]
public sealed class DemoSeedProviderTests
{
    [TestMethod]
    public void GetSeed_ReturnsEveryCollectionFromTheStore()
    {
        var dataset = BuildDataset();
        var sut = new DemoSeedProvider(StoreReturning(dataset));

        var response = sut.GetSeed();

        Assert.HasCount(dataset.Projects.Count, response.Projects);
        Assert.HasCount(dataset.TaskItems.Count, response.TaskItems);
        Assert.HasCount(dataset.Subtasks.Count, response.Subtasks);
        Assert.HasCount(dataset.TimeEntries.Count, response.TimeEntries);
        Assert.HasCount(dataset.Comments.Count, response.Comments);
        Assert.HasCount(dataset.Notifications.Count, response.Notifications);
        Assert.HasCount(dataset.SystemTasks.Count, response.SystemTasks);
    }

    [TestMethod]
    public void GetSeed_CopiesCollections_DoesNotShareTheStoreLists()
    {
        var dataset = BuildDataset();
        var sut = new DemoSeedProvider(StoreReturning(dataset));

        var response = sut.GetSeed();

        Assert.AreNotSame(dataset.TaskItems, response.TaskItems);
    }

    private static DemoDataset BuildDataset()
    {
        var dataset = new DemoDataset();
        dataset.Projects.Add(new ProjectDto { Title = "Demo Project" });
        dataset.TaskItems.Add(new TaskItemDto { Title = "Item" });
        dataset.Subtasks.Add(new SubtaskDto { Title = "Subtask" });
        dataset.TimeEntries.Add(new TimeEntryDto());
        dataset.Comments.Add(new CommentDto { Content = "Hi" });
        dataset.Notifications.Add(new NotificationDto { Title = "Welcome" });
        dataset.SystemTasks.Add(new SystemTaskDto { Name = "Synced" });
        return dataset;
    }

    private static IDemoStore StoreReturning(DemoDataset dataset)
    {
        var store = new Mock<IDemoStore>();
        store.SetupGet(s => s.Dataset).Returns(dataset);
        return store.Object;
    }
}
