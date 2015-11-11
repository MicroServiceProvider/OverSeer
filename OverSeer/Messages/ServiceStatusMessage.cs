namespace OverSeer.Messages
{
    public enum ServiceStatus
    {
        Pending = 0,
        Ok = 1,
        Fail = 2,
    }

    public class ServiceStatusMessage
    {
        public string ServiceUrl { get; }
        public ServiceStatus Status { get; }

        private ServiceStatusMessage(string url, ServiceStatus status)
        {
            this.Status = status;
            this.ServiceUrl = url;
        }

        public ServiceStatusMessage(string url)
        {
            this.Status = ServiceStatus.Pending;
            this.ServiceUrl = url;
        }

        public static ServiceStatusMessage Fail(string url)
        {
            return new ServiceStatusMessage(url, ServiceStatus.Fail);
        }

        public static ServiceStatusMessage Ok(string url)
        {
            return new ServiceStatusMessage(url, ServiceStatus.Ok);
        }
    }
}