# Taskly.Common

The security configuration the demo host is built with. `Taskly.Web` binds its settings to the
three option types in `Security/Options` (security headers, Content Security Policy, CORS) and
applies them through its own middleware in `Taskly.Web/Infrastructure/Security`.

| Folder | What it holds |
| --- | --- |
| `Security/Options` | The policy option types, bound from the `Security` section of the settings |
| `Security/Defaults` | The defaults those options start from |

---

*This project has been co-authored by Claude Code.*
