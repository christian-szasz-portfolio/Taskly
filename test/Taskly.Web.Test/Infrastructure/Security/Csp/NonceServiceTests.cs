namespace Taskly.Web.Test.Infrastructure.Security.Csp;

using Taskly.Web.Infrastructure.Security.Csp;

[TestClass]
public sealed class NonceServiceTests
{
    [TestMethod]
    public void Nonce_IsNotNullOrEmpty()
    {
        var service = new NonceService();

        Assert.IsFalse(string.IsNullOrEmpty(service.Nonce));
    }

    [TestMethod]
    public void Nonce_IsBase64Encoded()
    {
        var service = new NonceService();

        var bytes = Convert.FromBase64String(service.Nonce);
        Assert.HasCount(32, bytes);
    }

    [TestMethod]
    public void Nonce_IsDifferentForEachInstance()
    {
        var service1 = new NonceService();
        var service2 = new NonceService();

        Assert.AreNotEqual(service1.Nonce, service2.Nonce);
    }

    [TestMethod]
    public void Nonce_IsConsistentWithinInstance()
    {
        var service = new NonceService();

        var nonce1 = service.Nonce;
        var nonce2 = service.Nonce;

        Assert.AreEqual(nonce1, nonce2);
    }
}
