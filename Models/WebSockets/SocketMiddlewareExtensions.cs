using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;

namespace BitPortal.Models.WebSockets
{
    public static class SocketMiddlewareExtensions
    {
        public static IApplicationBuilder UseCustomWebSockets(this IApplicationBuilder app)
        {
            app.UseWebSockets();
            app.Use(async (httpContext, next) =>
            {
                if (httpContext.WebSockets.IsWebSocketRequest)
                {
                    var webSocket = await httpContext.WebSockets.AcceptWebSocketAsync();
                    var socketHandler = httpContext.RequestServices.GetRequiredService<ISocketHandler>();
                    await socketHandler.HandleWebSocketAsync(webSocket);
                }
                else
                {
                    await next();
                }
            });

            return app;
        }
    }
}
