namespace Taskly.Common.Test.Security.Options;

using Microsoft.VisualStudio.TestTools.UnitTesting;
using Taskly.Common.Security.Defaults;
using Taskly.Common.Security.Options;

[TestClass]
public class SecurityOptionsTests
{
    [TestMethod]
    public void CorsPolicyOptions_DefaultValues()
    {
        var options = new CorsPolicyOptions();

        Assert.IsEmpty(options.AllowedOrigins);
        CollectionAssert.AreEqual(SecurityDefaults.Cors.AllowedMethods, options.AllowedMethods);
        CollectionAssert.AreEqual(SecurityDefaults.Cors.AllowedHeaders, options.AllowedHeaders);
        CollectionAssert.AreEqual(SecurityDefaults.Cors.ExposedHeaders, options.ExposedHeaders);
        Assert.AreEqual(SecurityDefaults.Cors.PreflightMaxAgeSeconds, options.PreflightMaxAgeSeconds);
        Assert.IsTrue(options.AllowCredentials);
        Assert.IsTrue(options.StrictOriginValidation);
        Assert.IsTrue(options.AllowAnyOriginInDevelopment);
    }

    [TestMethod]
    public void CspPolicyOptions_DefaultValues()
    {
        var options = new CspPolicyOptions();

        Assert.IsTrue(options.Enabled);
        Assert.IsFalse(options.ReportOnly);
        Assert.IsNull(options.ReportUri);
        Assert.IsEmpty(options.AdditionalScriptSources);
        Assert.IsEmpty(options.AdditionalStyleSources);
        Assert.IsEmpty(options.AdditionalConnectSources);
        Assert.IsEmpty(options.AdditionalImageSources);
        Assert.IsEmpty(options.AdditionalFontSources);
        Assert.IsEmpty(options.AdditionalFrameSources);
        Assert.IsTrue(options.AllowInlineStyles);
        Assert.IsFalse(options.UseStrictDynamic);
        Assert.IsTrue(options.UseNonce);
        Assert.AreEqual("'self'", options.DefaultSrc);
        Assert.AreEqual("'none'", options.FrameAncestors);
        Assert.AreEqual("'self'", options.FormAction);
        Assert.AreEqual("'self'", options.BaseUri);
        Assert.IsTrue(options.UpgradeInsecureRequests);
    }

    [TestMethod]
    public void SecurityHeadersPolicyOptions_DefaultValues()
    {
        var options = new SecurityHeadersPolicyOptions();

        Assert.IsTrue(options.EnableHsts);
        Assert.IsFalse(options.EnableHstsInDevelopment);
        Assert.AreEqual(31536000, options.HstsMaxAgeSeconds);
        Assert.IsTrue(options.HstsIncludeSubDomains);
        Assert.IsTrue(options.HstsPreload);
        Assert.AreEqual("DENY", options.XFrameOptions);
        Assert.AreEqual("nosniff", options.XContentTypeOptions);
        Assert.AreEqual("1; mode=block", options.XXSSProtection);
        Assert.AreEqual("strict-origin-when-cross-origin", options.ReferrerPolicy);
        Assert.IsTrue(options.RemoveServerHeader);
        Assert.IsTrue(options.RemoveXPoweredByHeader);
        Assert.AreEqual("require-corp", options.CrossOriginEmbedderPolicy);
        Assert.AreEqual("same-origin", options.CrossOriginOpenerPolicy);
        Assert.AreEqual("same-origin", options.CrossOriginResourcePolicy);
    }

    [TestMethod]
    public void CorsPolicyOptions_SetValues()
    {
        var options = new CorsPolicyOptions
        {
            AllowedOrigins = ["https://example.com"],
            AllowedMethods = ["GET"],
            AllowedHeaders = ["Accept"],
            ExposedHeaders = ["X-Custom"],
            PreflightMaxAgeSeconds = 300,
            AllowCredentials = false,
            StrictOriginValidation = false,
            AllowAnyOriginInDevelopment = false,
        };

        Assert.HasCount(1, options.AllowedOrigins);
        Assert.AreEqual("https://example.com", options.AllowedOrigins[0]);
        Assert.AreEqual(300, options.PreflightMaxAgeSeconds);
        Assert.IsFalse(options.AllowCredentials);
    }

    [TestMethod]
    public void CspPolicyOptions_SetValues()
    {
        var options = new CspPolicyOptions
        {
            Enabled = false,
            ReportOnly = true,
            ReportUri = "/csp-report",
            AdditionalScriptSources = ["https://cdn.example.com"],
            AllowInlineStyles = false,
            UseStrictDynamic = true,
            UseNonce = false,
            DefaultSrc = "'none'",
            FrameAncestors = "'self'",
            UpgradeInsecureRequests = false,
        };

        Assert.IsFalse(options.Enabled);
        Assert.IsTrue(options.ReportOnly);
        Assert.AreEqual("/csp-report", options.ReportUri);
        Assert.HasCount(1, options.AdditionalScriptSources);
        Assert.IsFalse(options.AllowInlineStyles);
        Assert.IsTrue(options.UseStrictDynamic);
    }

    [TestMethod]
    public void SecurityHeadersPolicyOptions_SetValues()
    {
        var options = new SecurityHeadersPolicyOptions
        {
            EnableHsts = false,
            EnableHstsInDevelopment = true,
            HstsMaxAgeSeconds = 3600,
            HstsIncludeSubDomains = false,
            HstsPreload = false,
            XFrameOptions = "SAMEORIGIN",
            XContentTypeOptions = "custom",
            XXSSProtection = "0",
            ReferrerPolicy = "no-referrer",
            RemoveServerHeader = false,
            RemoveXPoweredByHeader = false,
        };

        Assert.IsFalse(options.EnableHsts);
        Assert.IsTrue(options.EnableHstsInDevelopment);
        Assert.AreEqual(3600, options.HstsMaxAgeSeconds);
        Assert.AreEqual("SAMEORIGIN", options.XFrameOptions);
        Assert.IsFalse(options.RemoveServerHeader);
    }
}
