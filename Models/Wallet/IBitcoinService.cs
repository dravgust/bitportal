using System;
using System.Threading.Tasks;
using CodersBand.Bitcoin.Balances;
using CodersBand.Bitcoin.Histories;
using CodersBand.Bitcoin.States;

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

        Task SendAsync(string address, decimal amount, string message);
    }
}
