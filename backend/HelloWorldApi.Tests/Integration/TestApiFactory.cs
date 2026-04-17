using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;

namespace HelloWorldApi.Tests.Integration;

public class TestApiFactory : WebApplicationFactory<Program>
{
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
                ["UseInMemoryDatabase"] = "true"
            });
        });
    }
}
