using BitPortal.Models.Wallet;
using BitPortal.Models.WebSockets;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using NLog.Extensions.Logging;

namespace BitPortal
{
    internal class Startup
    {
        public IConfigurationRoot Configuration { get; }
        private static BitcoinService _bitcoinService;

        public Startup(IHostingEnvironment env)
        {
            env.ConfigureNLog("nlog.config");

            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("applications.json", optional: true, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true);

            builder.AddEnvironmentVariables();

            Configuration = builder.Build();
        }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMvc();

            _bitcoinService = new BitcoinService();
            services.AddSingleton<IBitcoinService>(_bitcoinService);
            services.AddTransient<ISocketHandler, BitcoinSocketHandler>();
        }

        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory, IApplicationLifetime applicationLifetime)
        {
            applicationLifetime.ApplicationStopping.Register(OnShutdown);
            loggerFactory.AddNLog();

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
            }

            app.UseStaticFiles();
            app.UseCustomWebSockets();
            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller=Home}/{action=Index}/{id?}");
            });

            //try
            //{
            //    var info = new ProcessStartInfo("http://localhost:9000");
            //    Console.WriteLine(info.FileName);

            //    System.Diagnostics.Process.Start("http://localhost:9000");
            //}
            //catch(Win32Exception noBrowser)
            //{
            //    var path = Environment.ExpandEnvironmentVariables(@"%PROGRAMFILES%\Internet Explorer\iexplore.exe");

            //    Process.Start(path, "http://localhost:9000");
            //}
            //catch (System.Exception other)
            //{
            //    Console.WriteLine(other.Message);
            //}

        }

        private static void OnShutdown()
        {
            _bitcoinService?.Dispose();
        }
    }
}