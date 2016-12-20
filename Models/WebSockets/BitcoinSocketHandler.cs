using System;
using System.Runtime.Serialization;
using System.Threading.Tasks;
using BitPortal.Models.Wallet;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace BitPortal.Models.WebSockets
{
    [DataContract]
    public class BalanceInfoView
    {
        [DataMember]
        public decimal Confirmed { set; get; }
        [DataMember]
        public decimal Unconfirmed { set; get; }
        [DataMember]
        public decimal Balance => Confirmed + Unconfirmed;
    }
    
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
                var arguments = (BitcoinServiceArgs) args;
                SendAsync(Serialize(new { cmd = "state", data = arguments.State.ToString() }));
            };

            _bitcoinService.InitializationProgressChanged += (sender, args) =>
            {
                var arguments = (BitcoinServiceArgs)args;
                SendAsync(Serialize(new { cmd = "progress", data = arguments.InitializationProgress.ToString() }));
            };

            _bitcoinService.BalanceChanged += (sender, args) =>
            {
                var arguments = (BitcoinServiceArgs)args;

                SendAsync(Serialize(new { cmd = "history", data = arguments.Transaction }));

                SendAsync(Serialize(new { cmd = "balance", data = new BalanceInfoView
                {
                    Confirmed = arguments.BalanceInfo.Confirmed,
                    Unconfirmed = arguments.BalanceInfo.Unconfirmed
                }}));
            };
        }

        private static string Serialize(object message)
        {
           return JsonConvert.SerializeObject(message, new JsonSerializerSettings { ContractResolver = new CamelCasePropertyNamesContractResolver() });
        }

        //public override Task OnMessageAsync(string request)
        //{
           
        //}

        public override void OnClose()
        {
            
        }     
    }
}

