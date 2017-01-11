using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BitPortal.Models.Wallet;
using BitPortal.Models.WebSockets;
using CB.Bitcoin.Client;
using CB.Bitcoin.Client.Histories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace BitPortal.Controllers
{
    [Produces("application/json")]
    [Route("api/[controller]")]
    public class WalletController : Controller
    {
        private readonly IBitcoinService _bitcoinService;
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

        public WalletController(IBitcoinService bitcoinService, ILoggerFactory loggerFactory)
        {
            _bitcoinService = bitcoinService;
            _logger = loggerFactory?.CreateLogger<WalletController>();
        }

        [HttpGet("status")]
        public dynamic GetStatus()
        {
            return new { state = _bitcoinService.InitializationState.ToString(), progress = _bitcoinService.InitializationProgress };
        }

        [HttpGet("address")]
        public dynamic GetAddress()
        {
            return new { address = _bitcoinService.Address};
        }

        //[HttpGet("{id}", Name = "GetTodo")]
        [HttpGet("balance")]
        public async Task<BalanceInfoView> GetBalanceAsync()
        {
            //Console.WriteLine($"Number of monitored addresses: {safeBalanceInfo.MonitoredAddressCount}");
            //Console.WriteLine($"Balance: {safeBalanceInfo.Balance}");
            //Console.WriteLine($"Confirmed: {safeBalanceInfo.Confirmed}");
            //Console.WriteLine($"Unconfirmed: {safeBalanceInfo.Unconfirmed}");
            //foreach (var balanceInfo in safeBalanceInfo.AddressBalances)
            //{
            //    if (balanceInfo.Balance != 0)
            //        Console.WriteLine($"{balanceInfo.Address}: {balanceInfo.Balance}");
            //}

            var keyRingBalanceInfo = await _bitcoinService.GetBalanceInfoAsync().ConfigureAwait(false);

            return new BalanceInfoView
            {
                Confirmed = keyRingBalanceInfo.Confirmed,
                Unconfirmed = keyRingBalanceInfo.Unconfirmed
            };
        }

        [HttpGet("history")]
        public async Task<IEnumerable<AddressHistoryRecord>> GetHistoryAsync()
        {
            //Console.WriteLine("totalreceived: " + history.TotalReceived);
            //Console.WriteLine("totalspent: " + history.TotalSpent);
            //foreach (var record in history.Records)
            //{
            //    Console.WriteLine(record.Address + " " + record.Amount);
            //}

            var keyRingHistory = await _bitcoinService.GetHistoryAsync();
            return keyRingHistory.Records;
        }

        [HttpPost("send")]
        public async Task SendAsync([FromBody] PayTo payTo)
        {
            if(string.IsNullOrEmpty(payTo?.Address) || payTo.Amount <= 0)
                throw new ArgumentNullException(nameof(payTo));

            await _bitcoinService.SendAsync(payTo.Address, payTo.Amount, payTo.FeeType, payTo.Message);
        }
    }

    public class PayTo
    {
        public string Address { set; get; }
        public decimal Amount { set; get; }
        public FeeType FeeType { set; get; }
        public string Message { set; get; } = "test message";
    }
}