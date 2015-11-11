using System;
using System.Net;
using System.Net.Http;
using Akka.Actor;

namespace OverSeer.Actors
{
    public class CheckHealthActor : ReceiveActor
    {
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
                    //TODO: How to log this exception ?
                    this.Sender.Tell(new Tuple<string, bool>(serviceUrl, false));
                }
            });
        }
    }
}