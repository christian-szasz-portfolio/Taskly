namespace Taskly.Web.Infrastructure;

using Serilog.Sinks.SystemConsole.Themes;

public static class SerilogConsoleTheme
{
    public static AnsiConsoleTheme Theme { get; } = new(new Dictionary<ConsoleThemeStyle, string>
    {
        [ConsoleThemeStyle.Text] = "\x1b[38;5;15m",
        [ConsoleThemeStyle.SecondaryText] = "\x1b[38;5;7m",
        [ConsoleThemeStyle.TertiaryText] = "\x1b[38;5;8m",
        [ConsoleThemeStyle.Invalid] = "\x1b[38;5;11m",
        [ConsoleThemeStyle.Null] = "\x1b[38;5;27m",
        [ConsoleThemeStyle.Name] = "\x1b[38;5;7m",
        [ConsoleThemeStyle.String] = "\x1b[38;5;45m",
        [ConsoleThemeStyle.Number] = "\x1b[38;5;200m",
        [ConsoleThemeStyle.Boolean] = "\x1b[38;5;27m",
        [ConsoleThemeStyle.Scalar] = "\x1b[38;5;85m",
        [ConsoleThemeStyle.LevelVerbose] = "\x1b[38;5;7m",
        [ConsoleThemeStyle.LevelDebug] = "\x1b[38;5;7m",
        [ConsoleThemeStyle.LevelInformation] = "\x1b[38;5;15m",
        [ConsoleThemeStyle.LevelWarning] = "\x1b[38;5;208m",
        [ConsoleThemeStyle.LevelError] = "\x1b[1;38;5;208m",
        [ConsoleThemeStyle.LevelFatal] = "\x1b[1;38;5;208m",
    });
}
