using System;
using System.Net;
using System.Net.Http;
using Akka.Actor;
using Akka.Event;
using Akka.Routing;

namespace OverSeer.Actors
{
    public class CheckHealthActor : ReceiveActor
    {
        private readonly ILoggingAdapter _log = Context.GetLogger();

        public CheckHealthActor()
        {
            this.Receive<string>(serviceUrl =>
            {
                try
                {
                    using (var client = new HttpClient())
                    using (var response = client.GetAsync(serviceUrl).Result)
                    {
                        this.Sender.Tell(new Tuple<string, bool>(serviceUrl, response.StatusCode == HttpStatusCode.OK));
                    }
                }
                catch (Exception ex)
                {
                    _log.Error(ex, "Error");
                    this.Sender.Tell(new Tuple<string, bool>(serviceUrl, false));
                }
            });
        }
    }
}