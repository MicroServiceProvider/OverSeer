using System;
using System.Collections;
using Akka.Actor;
using OverSeer.Actors;

// PROJECT IDEA 0
// Microservice monitoring tool
// for each microservice Create an actor that does check the server status and reports the result
// 2. create a simple dashboard site
// 3. add more services and do a demo
// 4. add monitoring email sent that one of the services is down
// 5. create a visualization of the services

namespace OverSeer
{
    internal class Program
    {
        private static string[] servicesList =
        {
            "http://www.google.com",
            "http://www.mfranc.com",
            "http://www.justgiving.com",
            "http://www.campaign.justgiving.com",
            "http://www.home.justgiving.com",
            "http://www.tvn24.pl",
            "http://mfranc1.com/",
            "http://www.onet.pl",
            "http://www.wykop.pl",
            "http://www.natemat.pl",
            "http://www.wp.pl",
        };

        private static void Main()
        {
            var actorSystem = ActorSystem.Create("main");

            var consoleDashBoardActor = actorSystem.ActorOf(Props.Create<ConsoleDashBoardActor>());
            var monitorActor = actorSystem.ActorOf(Props.Create(() => new MonitorActor(consoleDashBoardActor)), "MonitorActor");

            actorSystem.Scheduler.ScheduleTellRepeatedlyCancelable(TimeSpan.FromSeconds(1), TimeSpan.FromSeconds(10), monitorActor, Program.servicesList, ActorRefs.Nobody);
            consoleDashBoardActor.Tell(servicesList);

            actorSystem.AwaitTermination();
        }
    }
}
