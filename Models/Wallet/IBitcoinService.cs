using System;
using System.Threading.Tasks;
using CB.Bitcoin.Client;
using CB.Bitcoin.Client.Balances;
using CB.Bitcoin.Client.Histories;
using CB.Bitcoin.Client.States;

namespace BitPortal.Models.Wallet
{
    public interface IBitcoinService : IDisposable
    {
        State InitializationState { get; }

        string Address { get; }

        event EventHandler InitializationStateChanged;

        int InitializationProgress { get; }
        event EventHandler InitializationProgressChanged;

        event EventHandler BalanceChanged;

        Task<KeyRingBalanceInfo> GetBalanceInfoAsync();

        Task<KeyRingHistory> GetHistoryAsync();

        Task SendAsync(string address, decimal amount, FeeType feeType = FeeType.Fastest, string message = null);
    }
}
