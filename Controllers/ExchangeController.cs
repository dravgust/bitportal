using System;
using BitPortal.Models.Market;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace BitPortal.Controllers
{
    [Produces("application/json")]
    [Route("api/[controller]")]
    public class ExchangeController : Controller
    {
        private readonly IExchangeService _exchangeService;
        private readonly ILogger<WalletController> _logger;

        private ILogger<WalletController> Logger
        {
            get
            {
                if (_logger == null)
                    throw new ArgumentNullException(nameof(LoggerFactory));

                return _logger;
            }
        }

        public ExchangeController(IExchangeService exchangeService, ILoggerFactory loggerFactory)
        {
            _exchangeService = exchangeService;
            _logger = loggerFactory?.CreateLogger<WalletController>();
        }

        [HttpGet("ticker")]
        public async Task<dynamic> GetTicker()
        {
            return await _exchangeService.GetTickerAsync().ConfigureAwait(false);

        }
    }
}