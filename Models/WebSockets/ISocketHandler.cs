using System.Net.WebSockets;
using System.Threading.Tasks;

namespace BitPortal.Models.WebSockets
{
    public interface ISocketHandler
    {
        void OnStart();

        void OnMessage();

        void OnClose();

        Task HandleWebSocketAsync(WebSocket webSocket);

        void SendAsync(string message);
    }
}
