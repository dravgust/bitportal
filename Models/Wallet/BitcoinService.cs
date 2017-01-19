using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BitPortal.Models.Utilities;
using CB.Bitcoin.Client;
using CB.Bitcoin.Client.Balances;
using CB.Bitcoin.Client.Histories;
using CB.Bitcoin.Client.KeyManagement;
using CB.Bitcoin.Client.Monitoring;
using CB.Bitcoin.Client.Sending;
using CB.Bitcoin.Client.States;
using Microsoft.Extensions.Logging;

namespace BitPortal.Models.Wallet
{
    public class BitcoinServiceArgs : EventArgs
    {
        public State State { set; get; }
        public int InitializationProgress { set; get; }
        public KeyRingBalanceInfo BalanceInfo { set; get; }
        public List<AddressHistoryRecord> Transactions { set; get; }
    }

    public class BitcoinService : IBitcoinService
    {
        private readonly ILogger<BitcoinService> _logger;
        protected ILogger<BitcoinService> Logger
        {
            get
            {
                if (_logger == null)
                    throw new ArgumentNullException(nameof(LoggerFactory));

                return _logger;
            }
        }

        private readonly HttpKeyRingMonitor _httpKeyRingMonitor;
        private readonly string _baseAddress;

        public State InitializationState { private set; get; }
        public event EventHandler InitializationStateChanged;

        public int InitializationProgress { private set; get; }
        public event EventHandler InitializationProgressChanged;

        public event EventHandler BalanceChanged;


        public BitcoinService(string baseAddress, ILoggerFactory loggerFactory)
        {
            _logger = loggerFactory?.CreateLogger<BitcoinService>();
            _baseAddress = baseAddress;

            const string walletFilePath = @"Wallets/hidden.dat";
            const string password = "pswd";
            const Network network = Network.TestNet;

            KeyRing keyRing;
            string mnemonic;

            if (!System.IO.File.Exists(walletFilePath))
            {
                keyRing = KeyRing.Create(out mnemonic, password, walletFilePath, network);
            }
            else
            {
                keyRing = KeyRing.Load(password, walletFilePath);
                if (keyRing.Network != network)
                    throw new Exception("Wrong network");
            }

            _httpKeyRingMonitor = new HttpKeyRingMonitor(_baseAddress, keyRing, addressCount: 100);

            // Report initialization progress
            _httpKeyRingMonitor.InitializationStateChanged += delegate (object sender, EventArgs args)
            {
                var monitor = (HttpKeyRingMonitor)sender;

                _logger.LogDebug($"state changed: {monitor.InitializationState}");

                InitializationState = monitor.InitializationState;
                InitializationStateChanged?.Invoke(null,
                        new BitcoinServiceArgs {State = monitor.InitializationState});
            };

            _httpKeyRingMonitor.InitializationProgressPercentChanged += delegate(object sender, EventArgs args)
            {
                var monitor = (HttpKeyRingMonitor) sender;

                _logger.LogDebug($"progress changed: {monitor.InitializationProgressPercent}");

                InitializationProgress = monitor.InitializationProgressPercent;
                InitializationProgressChanged?.Invoke(null,
                    new BitcoinServiceArgs {InitializationProgress = monitor.InitializationProgressPercent});
            };

            _httpKeyRingMonitor.BalanceChanged += delegate (object sender, EventArgs args)
            {
                var monitor = (HttpKeyRingMonitor)sender;
                var arguments = (BalanceUpdateEventArgs) args;

                _logger.LogDebug($"Change happened\r\n" +
                                 $"Balance of safe: {monitor.KeyRingBalanceInfo.Balance}\r\n" +
                                 $"Confirmed balance of safe: {monitor.KeyRingBalanceInfo.Confirmed}\r\n" +
                                 $"Unconfirmed balance of safe: {monitor.KeyRingBalanceInfo.Unconfirmed}");

                BalanceChanged?.Invoke(null,
                    new BitcoinServiceArgs {BalanceInfo = monitor.KeyRingBalanceInfo, Transactions = arguments.HistoryRecords });
            };
        }

        public string Address
        {
            get
            {
                var rand = new Random();
                return _httpKeyRingMonitor.KeyRing.GetAddress(rand.Next(100));
            }
        }

        public async Task<KeyRingBalanceInfo> GetBalanceInfoAsync()
        {
            await WaitUntilInitializedAsync();
            return _httpKeyRingMonitor.KeyRingBalanceInfo;
        }

        public async Task<KeyRingHistory> GetHistoryAsync()
        {
            await WaitUntilInitializedAsync();
            return _httpKeyRingMonitor.KeyRingHistory;
        }

        public async Task SendAsync(string address, decimal amount, FeeType feeType = FeeType.Fastest, string message = null)
        {
            if (_httpKeyRingMonitor.InitializationState != State.Ready)
                throw new Exception("not initialized");

            var spender = new HttpKeyRingBuilder(_httpKeyRingMonitor.KeyRing);

            spender.TransactionBuildStateChanged += delegate (object sender, EventArgs args)
            {
                var currentSpender = sender as HttpKeyRingBuilder;
                _logger.LogDebug($"TransactionBuildStateChanged: {currentSpender?.TransactionBuildState}");
            };

            _logger.LogDebug($"Create transaction to address {address} {amount} B {feeType}; message: {message}");

           var tx = spender.BuildTransaction(
                new List<AddressAmountPair>
                {
                    new AddressAmountPair
                    {
                        Address = address,
                        Amount = amount
                    }
                }, feeType, message);

            _logger.LogDebug($"Transaction created {tx.ToJSON()}");

            await Sender.SendAsync(_baseAddress, ConnectionType.Http, tx);

            _logger.LogDebug($"Transaction sent: {tx.Id}" );
        }

        private async Task WaitUntilInitializedAsync()
        {
            // Let's wait until initialized
            while (_httpKeyRingMonitor.InitializationState != State.Ready)
                await Task.Delay(100);
        }

        public void Dispose()
        {
            _httpKeyRingMonitor.StopMonitoring();
        }
    }
}
