namespace Taskly.Web.Test.Demo;

using Microsoft.AspNetCore.Mvc;
using Moq;
using Taskly.Web.Demo;

[TestClass]
public sealed class DemoControllerTests
{
    [TestMethod]
    public void GetSeed_ReturnsOkWithSeedResponse()
    {
        var dataset = new DemoDataset();
        dataset.Projects.Add(new ProjectDto { Key = "DEMO" });
        dataset.TaskItems.Add(new TaskItemDto { Title = "Item" });
        var store = new Mock<IDemoStore>();
        store.SetupGet(s => s.Dataset).Returns(dataset);
        var sut = new DemoController(new DemoSeedProvider(store.Object));

        var result = sut.GetSeed();

        var ok = result.Result as OkObjectResult;
        Assert.IsNotNull(ok);
        var response = ok.Value as DemoSeedResponse;
        Assert.IsNotNull(response);
        Assert.AreEqual("DEMO", response.Projects[0].Key);
        Assert.HasCount(1, response.TaskItems);
    }
}
