using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using System.IO;

namespace HelloWorldApi.Tests.Integration;

public class TestApiFactory : WebApplicationFactory<Program>
{
    private readonly string _testDbPath = Path.Combine(Path.GetTempPath(), $"hello-world-api-tests-{Guid.NewGuid():N}.db");

    public TestApiFactory()
    {
        Environment.SetEnvironmentVariable(
            "JWT_SIGNING_KEY",
            "integration-tests-signing-key-at-least-32");
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureAppConfiguration((_, configBuilder) =>
        {
            configBuilder.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["JWT_SIGNING_KEY"] = "integration-tests-signing-key-at-least-32",
                ["ConnectionStrings:DefaultConnection"] = $"Data Source={_testDbPath}"
            });
        });
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);

        if (!disposing)
        {
            return;
        }

        try
        {
            if (File.Exists(_testDbPath))
            {
                File.Delete(_testDbPath);
            }
        }
        catch
        {
            // Best effort cleanup for local test artifacts.
        }
    }
}
