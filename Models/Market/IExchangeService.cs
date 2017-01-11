using System;
using System.Threading.Tasks;

namespace BitPortal.Models.Market
{
    public interface IExchangeService : IDisposable
    {
        Task<dynamic> GetTickerAsync();
    }
}
