namespace Taskly.Web.Test.Demo;

using Taskly.Contracts.Enums.Issues;
using Taskly.Contracts.Enums.Notifications;
using Taskly.Contracts.Enums.Projects;
using Taskly.Web.Demo;

[TestClass]
public sealed class DemoSeedManagerTests
{
    private readonly DemoSeedManager sut = new();

    [TestMethod]
    public void Build_PopulatesEveryCollection()
    {
        var dataset = this.sut.Build();

        Assert.IsGreaterThan(0, dataset.Projects.Count);
        Assert.IsGreaterThan(0, dataset.TaskItems.Count);
        Assert.IsGreaterThan(0, dataset.Subtasks.Count);
        Assert.IsGreaterThan(0, dataset.TimeEntries.Count);
        Assert.IsGreaterThan(0, dataset.Notifications.Count);
        Assert.IsGreaterThan(0, dataset.SystemTasks.Count);

        // The original orchestrator seeds no comments.
        Assert.IsEmpty(dataset.Comments);
    }

    [TestMethod]
    public void Build_SeedsTwoProjects_DemoActive_SampleInactive()
    {
        var dataset = this.sut.Build();

        Assert.HasCount(2, dataset.Projects);

        var demo = dataset.Projects.Single(p => p.Key == "DEMO");
        Assert.AreEqual(ProjectStatus.Active, demo.Status);
        Assert.AreEqual("Demo Project", demo.Title);

        var sample = dataset.Projects.Single(p => p.Key == "SAMPLE");
        Assert.AreEqual(ProjectStatus.Inactive, sample.Status);
        Assert.AreEqual("Sample Project", sample.Title);
    }

    [TestMethod]
    public void Build_ProducesTheFullPerProjectStructure()
    {
        var dataset = this.sut.Build();

        // 12 task items (1 epic + 5 standalone + 2 with-subtasks + 2 backlog + 2 resolved) and
        // 10 subtasks (5 + 5) per project, across both projects.
        Assert.HasCount(24, dataset.TaskItems);
        Assert.HasCount(20, dataset.Subtasks);
    }

    [TestMethod]
    public void Build_TaskItems_HaveExplicitNonDefaultEnums()
    {
        var dataset = this.sut.Build();

        foreach (var item in dataset.TaskItems)
        {
            Assert.AreNotEqual(0, (int)item.Priority);
            Assert.AreNotEqual(0, (int)item.Variant);
        }
    }

    [TestMethod]
    public void Build_TaskItems_BelongToASeededProject()
    {
        var dataset = this.sut.Build();
        var projectIds = dataset.Projects.Select(p => p.Id).ToHashSet();

        Assert.IsTrue(dataset.TaskItems.TrueForAll(item => projectIds.Contains(item.ProjectId)));
    }

    [TestMethod]
    public void Build_Subtask_LinksToAnExistingTaskItem()
    {
        var dataset = this.sut.Build();

        var subtask = dataset.Subtasks[0];
        Assert.IsTrue(dataset.TaskItems.Exists(item => item.Id == subtask.ParentTaskItemId));
    }

    [TestMethod]
    public void Build_UsesRoundTripIsoDateStrings()
    {
        var dataset = this.sut.Build();

        Assert.IsTrue(DateTime.TryParse(dataset.Projects[0].CreatedAtUtc, out _));
        Assert.IsTrue(DateTime.TryParse(dataset.TaskItems[0].CreatedAtUtc, out _));
    }

    [TestMethod]
    public void Build_IncludesAnEpicAndAStoryVariant()
    {
        var dataset = this.sut.Build();

        Assert.IsTrue(dataset.TaskItems.Exists(item => item.Variant == IssueType.Epic));
        Assert.IsTrue(dataset.TaskItems.Exists(item => item.Variant == IssueType.Story));
    }

    [TestMethod]
    public void Build_SystemTasks_IncludeARunningTask()
    {
        var dataset = this.sut.Build();

        Assert.IsTrue(dataset.SystemTasks.Exists(task => task.State == SystemTaskState.Started));
    }
}
