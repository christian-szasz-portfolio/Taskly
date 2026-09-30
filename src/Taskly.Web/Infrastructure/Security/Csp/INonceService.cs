namespace Taskly.Web.Infrastructure.Security.Csp;

/// <summary>
/// Service for generating cryptographically secure nonces for Content Security Policy.
/// </summary>
public interface INonceService
{
    /// <summary>
    /// Gets the nonce for the current request.
    /// </summary>
    string Nonce { get; }
}
