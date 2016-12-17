using System.IO;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;

namespace BitPortal
{
    internal class Program
    {
        public static void Main(string[] args)
        {
            var hostConfig = new ConfigurationBuilder()
                .AddCommandLine(args) //>dotnet run --environment "Staging" --server.urls=http://0.0.0.0:5001
                .Build();
            var currentDirectory = Directory.GetCurrentDirectory();
            var host = new WebHostBuilder()
                .UseEnvironment("Development")
                .UseContentRoot(currentDirectory)
                .UseWebRoot(Path.Combine(currentDirectory, "Content"))
                .UseConfiguration(hostConfig)
                .UseKestrel()
                .UseUrls("http://0.0.0.0:9000")
                .UseStartup<Startup>()
                .Build();

            host.Run();
        }
    }
}