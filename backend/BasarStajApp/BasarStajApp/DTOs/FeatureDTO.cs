using NetTopologySuite.Geometries;

namespace BasarStajApp.DTOs
{
    public class FeatureDTO //data transfer object
    {
        public int ID { get; set; }
        public string Name { get; set; }
        public string WKT { get; set; }


    }
}

//veriyi bir katmandan diğerine taşımak için kullanıyoruz