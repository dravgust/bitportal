using System;
using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace BitPortal.Models.WebSockets
{
    public abstract class SocketHandler : ISocketHandler
    {
        
        private static readonly ConcurrentDictionary<string, WebSocket> WebSocketCollection = new ConcurrentDictionary<string, WebSocket>();
        protected WebSocket Socket;
        private readonly ILogger<SocketHandler> _logger;
        protected ILogger<SocketHandler> Logger
        {
            get
            {
                if (_logger == null)
                    throw new ArgumentNullException(nameof(LoggerFactory));

                return _logger;
            }
        }

        protected SocketHandler(ILoggerFactory loggerFactory)
        {
            _logger = loggerFactory?.CreateLogger<SocketHandler>();
        }

        public abstract void OnStart();

        public abstract void OnMessage();

        public abstract void OnClose();

        public async void SendAsync(string message)
        {
            var buffer = new ArraySegment<byte>(Encoding.UTF8.GetBytes(message));
            await Socket.SendAsync(buffer, WebSocketMessageType.Text, true, CancellationToken.None);
        }

        public async Task HandleWebSocketAsync(WebSocket webSocket)
        {
            WebSocketCollection.TryAdd($"{Guid.NewGuid()}", Socket = webSocket);
            OnStart();
            while (Socket.State == WebSocketState.Open)
            {
                try
                {
                    var token = CancellationToken.None;
                    var buffer = new ArraySegment<byte>(new byte[4096]);
                    var received = await Socket.ReceiveAsync(buffer, token);

                    switch (received.MessageType)
                    {
                        case WebSocketMessageType.Close:
                            OnClose();
                            break;
                        case WebSocketMessageType.Binary:
                            break;
                        case WebSocketMessageType.Text:
                            OnMessage();
                            var request = Encoding.UTF8.GetString(buffer.Array, buffer.Offset, buffer.Count);
                            var type = WebSocketMessageType.Text;
                            var data = Encoding.UTF8.GetBytes(request);
                            buffer = new ArraySegment<byte>(data);

                            Parallel.ForEach(WebSocketCollection, async (socket) =>
                            {
                                if (socket.Value != null && socket.Value.State == WebSocketState.Open)
                                {
                                    await socket.Value.SendAsync(buffer, type, true, token);
                                }
                            });

                            //await _socket.SendAsync(buffer, type, true, token);
                            break;

                    }
                }
                catch (Exception e)
                {
                    Logger.LogError(e.Message);
                }
            }
        }      
    }
}

