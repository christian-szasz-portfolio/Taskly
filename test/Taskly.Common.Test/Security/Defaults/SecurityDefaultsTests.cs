namespace Taskly.Common.Test.Security.Defaults;

using System.Diagnostics.CodeAnalysis;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Taskly.Common.Security.Defaults;

[TestClass]
[SuppressMessage("Design", "MSTEST0032:Assertion condition is always true", Justification = "Ok. We want to verify the default values are correct, even if they are constants.")]
public class SecurityDefaultsTests
{
    [TestMethod]
    public void CorsDefaults_HaveExpectedValues()
    {
        Assert.AreEqual(600, SecurityDefaults.Cors.PreflightMaxAgeSeconds);
        Assert.IsTrue(SecurityDefaults.Cors.AllowCredentials);
        Assert.IsTrue(SecurityDefaults.Cors.StrictOriginValidation);
        Assert.IsTrue(SecurityDefaults.Cors.AllowAnyOriginInDevelopment);
        CollectionAssert.Contains(SecurityDefaults.Cors.AllowedMethods, "GET");
        CollectionAssert.Contains(SecurityDefaults.Cors.AllowedMethods, "POST");
        CollectionAssert.Contains(SecurityDefaults.Cors.AllowedHeaders, "Authorization");
        CollectionAssert.Contains(SecurityDefaults.Cors.ExposedHeaders, "X-Pagination");
    }

    [TestMethod]
    public void CspDefaults_HaveExpectedValues()
    {
        Assert.IsTrue(SecurityDefaults.Csp.Enabled);
        Assert.IsFalse(SecurityDefaults.Csp.ReportOnly);
        Assert.IsTrue(SecurityDefaults.Csp.AllowInlineStyles);
        Assert.IsFalse(SecurityDefaults.Csp.UseStrictDynamic);
        Assert.IsTrue(SecurityDefaults.Csp.UseNonce);
        Assert.AreEqual("'self'", SecurityDefaults.Csp.DefaultSrc);
        Assert.AreEqual("'none'", SecurityDefaults.Csp.FrameAncestors);
        Assert.AreEqual("'self'", SecurityDefaults.Csp.FormAction);
        Assert.AreEqual("'self'", SecurityDefaults.Csp.BaseUri);
        Assert.IsTrue(SecurityDefaults.Csp.UpgradeInsecureRequests);
    }

    [TestMethod]
    public void SecurityHeadersDefaults_HaveExpectedValues()
    {
        Assert.IsTrue(SecurityDefaults.SecurityHeaders.EnableHsts);
        Assert.IsFalse(SecurityDefaults.SecurityHeaders.EnableHstsInDevelopment);
        Assert.AreEqual(31536000, SecurityDefaults.SecurityHeaders.HstsMaxAgeSeconds);
        Assert.IsTrue(SecurityDefaults.SecurityHeaders.HstsIncludeSubDomains);
        Assert.IsTrue(SecurityDefaults.SecurityHeaders.HstsPreload);
        Assert.AreEqual("DENY", SecurityDefaults.SecurityHeaders.XFrameOptions);
        Assert.AreEqual("nosniff", SecurityDefaults.SecurityHeaders.XContentTypeOptions);
        Assert.AreEqual("1; mode=block", SecurityDefaults.SecurityHeaders.XXSSProtection);
        Assert.AreEqual("strict-origin-when-cross-origin", SecurityDefaults.SecurityHeaders.ReferrerPolicy);
        Assert.IsTrue(SecurityDefaults.SecurityHeaders.RemoveServerHeader);
        Assert.IsTrue(SecurityDefaults.SecurityHeaders.RemoveXPoweredByHeader);
        Assert.AreEqual("require-corp", SecurityDefaults.SecurityHeaders.CrossOriginEmbedderPolicy);
        Assert.AreEqual("same-origin", SecurityDefaults.SecurityHeaders.CrossOriginOpenerPolicy);
        Assert.AreEqual("same-origin", SecurityDefaults.SecurityHeaders.CrossOriginResourcePolicy);
    }
}
