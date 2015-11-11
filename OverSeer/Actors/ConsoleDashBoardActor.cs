using System;
using System.Collections.Generic;
using Akka.Actor;
using OverSeer.Messages;

namespace OverSeer.Actors
{
    public class ConsoleDashBoardActor : ReceiveActor
    {

        private readonly Dictionary<string, ServiceStatus> internalState;  

        public ConsoleDashBoardActor()
        {
            this.internalState = new Dictionary<string, ServiceStatus>();

            this.Receive<IEnumerable<string>>(list =>
            {
                foreach (var s in list)
                {
                    internalState.Add(s, ServiceStatus.Pending);
                }

                this.Refresh();
            });

            this.Receive<ServiceStatusMessage> (m =>
            {
                internalState[m.ServiceUrl] = m.Status;
                this.Refresh();
            });
        }

        private void Refresh()
        {
            Console.Clear();
            foreach (var serviceStatuse in internalState)
            {
                Console.ForegroundColor = this.Color(serviceStatuse.Value);
                Console.WriteLine($"{serviceStatuse.Key}");
                Console.ResetColor();
            }
        }

        private ConsoleColor Color(ServiceStatus status)
        {
            switch (status)
            {
                case ServiceStatus.Pending : 
                    return ConsoleColor.DarkYellow;
                case ServiceStatus.Ok:
                    return ConsoleColor.Green;
                case ServiceStatus.Fail:
                    return ConsoleColor.Red;
                default:
                    throw new ArgumentOutOfRangeException(nameof(status), status, null);
            }
        }
    }
}