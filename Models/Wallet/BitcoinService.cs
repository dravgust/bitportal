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
        public State State { get; }
        public int InitializationProgress { private set; get; }
        public KeyRingBalanceInfo BalanceInfo { private set; get; }
        public string TransactionId { private set; get; }

        public BitcoinServiceArgs(State state, int progress = 0)
        {
            State = state;

            if(State == State.InProgress)
                InitializationProgress = progress;
        }

        public BitcoinServiceArgs(KeyRingBalanceInfo balanceInfo, string transactionId)
        {
            BalanceInfo = balanceInfo;
            TransactionId = transactionId;
        }
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

            _httpKeyRingMonitor = new HttpKeyRingMonitor(keyRing, addressCount: 105);

            // Report initialization progress
            _httpKeyRingMonitor.InitializationStateChanged += delegate (object sender, EventArgs args)
            {
               var monitor = (HttpKeyRingMonitor)sender;
                var serviceArgs = new BitcoinServiceArgs(InitializationState = monitor.InitializationState);
                InitializationStateChanged?.Invoke(this, serviceArgs);              
            };

            _httpKeyRingMonitor.InitializationProgressPercentChanged += delegate (object sender, EventArgs args)
            {
                var monitor = (HttpKeyRingMonitor)sender;
                if (monitor.InitializationState == State.InProgress)
                {
                    var serviceArgs = new BitcoinServiceArgs(monitor.InitializationState,
                        InitializationProgress = monitor.InitializationProgressPercent);
                    InitializationProgressChanged?.Invoke(this, serviceArgs);
                }
            };

            _httpKeyRingMonitor.BalanceChanged += delegate (object sender, EventArgs args)
            {
                var monitor = (HttpKeyRingMonitor)sender;
                var transactionId = monitor.KeyRingHistory.Records.OrderBy(x => x.DateTime).Last().TransactionId;
                BalanceChanged?.Invoke(this, new BitcoinServiceArgs(monitor.KeyRingBalanceInfo, transactionId));
            };
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
    }
}
