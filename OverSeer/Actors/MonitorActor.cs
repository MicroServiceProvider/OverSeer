using System;
using System.Collections.Generic;
using Akka.Actor;
using Akka.Routing;
using OverSeer.Messages;

namespace OverSeer.Actors
{
    public class MonitorActor : ReceiveActor
    {
        public MonitorActor(IActorRef consoleDashBoard)
        {
            var serviceActor = Context.ActorOf(Props.Create<CheckHealthActor>().WithRouter(new RoundRobinPool(10)));

            this.Receive<IEnumerable<string>>(list =>
            {
                foreach (var serviceUrl in list)
                {
                    serviceActor.Tell(serviceUrl);
                }
            });

            this.Receive<Tuple<string, bool>>(t => { consoleDashBoard.Tell(t.Item2 ? ServiceStatusMessage.Ok(t.Item1) : ServiceStatusMessage.Fail(t.Item1)); });
        }
    }
}