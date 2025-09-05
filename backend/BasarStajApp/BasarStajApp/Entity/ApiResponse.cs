namespace BasarStajApp.Entity
{
    public class ApiResponse<T> 
    {
        private bool v;
        private string pointAdded;
        private Feature addedPoint;

        public bool Success { get; set; }
        public string Message { get; set; }
        public object Meta { get; set; }
        public T Data { get; set; }

        public ApiResponse(bool success, string message, T data, object meta = null)
        {
            Success = success;
            Message = message;
            Data = data;
            Meta = meta;
        }

        public ApiResponse(bool v, string pointAdded, List<Feature> points, Feature addedPoint)
        {
            this.v = v;
            this.pointAdded = pointAdded;
            this.addedPoint = addedPoint;
        }
    }
}
