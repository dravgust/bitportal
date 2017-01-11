using System;
using System.Net.Http;
using System.Threading.Tasks;

namespace BitPortal.Models.Market
{
    public class CexIoService : IExchangeService
    {
        public async Task<dynamic> GetTickerAsync()
        {
            try
            {
                using (var httpClient = new HttpClient())
                {
                    var result = await httpClient.GetStreamAsync("https://cex.io/api/ticker/BTC/USD");

                    return result;
                }
            }
            catch (Exception)
            {

                throw;
            }
        }

        public void Dispose()
        {
            throw new System.NotImplementedException();
        }
    }
}
