namespace Taskly.Web.Demo;

using Microsoft.AspNetCore.Mvc;

/// <summary>
/// The single API surface of the demo backend: returns a fresh, fully-formed demo dataset.
/// The Angular client calls this once per trial and then owns the data client-side, so the
/// server stays almost idle (≈90% client-side).
/// </summary>
[ApiController]
[Route("api/demo")]
public sealed class DemoController(DemoSeedProvider seedProvider) : ControllerBase
{
    /// <summary>Returns the seeded demo workspace (project + items + subtasks + schedules + comments + notifications).</summary>
    [HttpGet("seed")]
    public ActionResult<DemoSeedResponse> GetSeed() => this.Ok(seedProvider.GetSeed());
}
