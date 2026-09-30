namespace Taskly.Web.Infrastructure.Security.Csp;

using System.Security.Cryptography;

/// <summary>
/// Scoped service that generates a unique nonce per request for CSP.
/// </summary>
public sealed class NonceService : INonceService
{
    /// <summary>
    /// Initializes a new instance of the <see cref="NonceService"/> class.
    /// </summary>
    public NonceService()
    {
        var bytes = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(bytes);
        this.Nonce = Convert.ToBase64String(bytes);
    }

    /// <inheritdoc/>
    public string Nonce { get; }
}
