using System;
using System.ComponentModel;
using System.Diagnostics;
using System.Runtime.InteropServices;
using BitPortal.Models.Market;
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
        private ILogger<Startup> _logger;

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

            //_bitcoinService = new BitcoinService();
            //services.AddSingleton<IBitcoinService>(_bitcoinService);
            services.AddSingleton<IBitcoinService, BitcoinService>();
            services.AddSingleton<IExchangeService, CexIoService>();
            services.AddTransient<ISocketHandler, BitcoinSocketHandler>();
        }

        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory, IApplicationLifetime applicationLifetime)
        {
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

            applicationLifetime.ApplicationStopping.Register(OnShutdown);
            applicationLifetime.ApplicationStarted.Register(OnStarted);

            _logger = loggerFactory.CreateLogger<Startup>();
        }

        private void OnStarted()
        {
            try
            {
                var url = "http://localhost:9000";
                if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
                {
                    Process.Start(new ProcessStartInfo("cmd", $"/c start {url}")); // Works ok on windows
                }
                else if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
                {
                    Process.Start("xdg-open", url);  // Works ok on linux
                }
                else if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX))
                {
                    Process.Start("open", url); // Not tested
                }
            }
            catch (Exception e)
            {
                _logger.LogError(e.Message);
            }
        }

        private static void OnShutdown()
        {
            //_bitcoinService?.Dispose();
        }
    }
}