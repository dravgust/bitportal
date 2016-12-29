using System;
using BitPortal.Models.Wallet;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace BitPortal.Controllers
{
    public class HomeController : Controller
    {
        private readonly IBitcoinService _bitcoinService;
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
        public HomeController(IBitcoinService bitcoinService, ILoggerFactory loggerFactory)
        {
            _bitcoinService = bitcoinService;
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
