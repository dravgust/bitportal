using System;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace BitPortal.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private ILogger<HomeController> Logger
        {
            get
            {
                if (_logger == null)
                    throw new ArgumentNullException(nameof(LoggerFactory));

                return _logger;
            }
        }
        public HomeController(ILoggerFactory loggerFactory)
        {
            _logger = loggerFactory?.CreateLogger<HomeController>();
        }

        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Error()
        {
            return View();
        }
    }
}
