using System;
using System.Linq;
using System.Threading.Tasks;
using CodersBand.Bitcoin;
using CodersBand.Bitcoin.Balances;
using CodersBand.Bitcoin.Histories;
using CodersBand.Bitcoin.KeyManagement;
using CodersBand.Bitcoin.Monitoring;
using CodersBand.Bitcoin.States;

namespace BitPortal.Models.Wallet
{
    public class BitcoinServiceArgs : EventArgs
    {
        public State State { set; get; }
        public int InitializationProgress { set; get; }
        public KeyRingBalanceInfo BalanceInfo { set; get; }
        public AddressHistoryRecord Transaction { set; get; }
    }

    public class BitcoinService : IBitcoinService
    {
        private readonly HttpKeyRingMonitor _httpKeyRingMonitor;

        public State InitializationState { private set; get; }
        public event EventHandler InitializationStateChanged;

        public int InitializationProgress { private set; get; }
        public event EventHandler InitializationProgressChanged;

        public event EventHandler BalanceChanged;

        public BitcoinService()
        {
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

            _httpKeyRingMonitor = new HttpKeyRingMonitor(keyRing, addressCount: 100);

            // Report initialization progress
            _httpKeyRingMonitor.InitializationStateChanged += delegate (object sender, EventArgs args)
            {
                var monitor = (HttpKeyRingMonitor)sender;
                Console.WriteLine("state changed: " + monitor.InitializationState);

             InitializationState = monitor.InitializationState;
             InitializationStateChanged?.Invoke(null,
                        new BitcoinServiceArgs {State = monitor.InitializationState});
            };

            _httpKeyRingMonitor.InitializationProgressPercentChanged += delegate (object sender, EventArgs args)
            {
                var monitor = (HttpKeyRingMonitor)sender;
                Console.WriteLine("progress changed: " + monitor.InitializationProgressPercent);

                InitializationProgress = monitor.InitializationProgressPercent;
                InitializationProgressChanged?.Invoke(null,
                    new BitcoinServiceArgs {InitializationProgress = monitor.InitializationProgressPercent});
            };

            _httpKeyRingMonitor.BalanceChanged += delegate (object sender, EventArgs args)
            {
                var monitor = (HttpKeyRingMonitor)sender;

                Console.WriteLine();
                Console.WriteLine("Change happened");
                Console.WriteLine($"Balance of safe: {monitor.KeyRingBalanceInfo.Balance}");
                Console.WriteLine($"Confirmed balance of safe: {monitor.KeyRingBalanceInfo.Confirmed}");
                Console.WriteLine($"Unconfirmed balance of safe: {monitor.KeyRingBalanceInfo.Unconfirmed}");

                var transaction = monitor.KeyRingHistory.Records.OrderBy(x => x.DateTime).Last();

                Console.WriteLine($"TransacitonId: {transaction.TransactionId}");

                BalanceChanged?.Invoke(null,
                    new BitcoinServiceArgs {BalanceInfo = monitor.KeyRingBalanceInfo, Transaction = transaction});
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

        private async Task WaitUntilInitializedAsync()
        {
            // Let's wait until initialized
            while (_httpKeyRingMonitor.InitializationState != State.Ready)
                await Task.Delay(100);
        }

        public void Dispose()
        {
            _httpKeyRingMonitor.Stop();
        }
    }
}
