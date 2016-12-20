using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BitPortal.Models.Wallet;
using BitPortal.Models.WebSockets;
using CodersBand.Bitcoin.Histories;
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

        //[HttpGet("{id}", Name = "GetTodo")]
        [HttpGet("balance")]
        public async Task<BalanceInfoView> GetBalance()
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

            var keyRingBalanceInfo = await _bitcoinService.GetBalanceInfoAsync();

            return new BalanceInfoView
            {
                Confirmed = keyRingBalanceInfo.Confirmed,
                Unconfirmed = keyRingBalanceInfo.Unconfirmed
            };
        }

        [HttpGet("history")]
        public async Task<IEnumerable<AddressHistoryRecord>> GetHistory()
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
    }
}