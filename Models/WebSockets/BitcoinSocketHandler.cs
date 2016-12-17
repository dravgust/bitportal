using System;
using System.Collections.Concurrent;
using System.Linq;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using BitPortal.Models.Wallet;
using Microsoft.Extensions.Logging;
using NLog;

namespace BitPortal.Models.WebSockets
{
    public class BitcoinSocketHandler : SocketHandler
    {
        private readonly IBitcoinService _bitcoinService;

        public BitcoinSocketHandler(IBitcoinService bitcoinService, ILoggerFactory loggerFactory)
            : base(loggerFactory)
        {
            _bitcoinService = bitcoinService;
        }

        public override void OnStart()
        {
            _bitcoinService.InitializationStateChanged += (sender, args) =>
            {
                Console.WriteLine("state changed: " + ((BitcoinServiceArgs)args).State.ToString());
                SendAsync(((BitcoinServiceArgs)args).State.ToString());
            };

            _bitcoinService.InitializationStateChanged += (sender, args) =>
            {
                Console.WriteLine("progress changed: " + ((BitcoinServiceArgs)args).InitializationProgress.ToString());
                SendAsync(((BitcoinServiceArgs)args).InitializationProgress.ToString());
            };

            _bitcoinService.BalanceChanged += (sender, args) =>
            {
                var monitor = (BitcoinServiceArgs) args;
                Console.WriteLine();
                Console.WriteLine("Change happened");
                Console.WriteLine($"Balance of safe: {monitor.BalanceInfo.Balance}");
                Console.WriteLine($"Confirmed balance of safe: {monitor.BalanceInfo.Confirmed}");
                Console.WriteLine($"Unconfirmed balance of safe: {monitor.BalanceInfo.Unconfirmed}");

                Console.WriteLine($"TransacitonId: {monitor.TransactionId}");

                SendAsync(((BitcoinServiceArgs)args).InitializationProgress.ToString());
            };
        }

        public override void OnMessage()
        {
           
        }

        public override void OnClose()
        {
            
        }     
    }
}

