using NetTopologySuite.Geometries;
using System.ComponentModel.DataAnnotations;


namespace BasarStajApp.Entity
{
    public class Feature
    {
        //entityler
        public int Id { get; set; }
        public string Name { get; set; }

        public string? WKT { get; set; } //well known text

         
        public Geometry Location { get; set; }
         

        //(wkt leri 3 şekilde tutuyoruz)
        //point(x y olarak tutulabilir) 
        //linestring (x,y) (a,b)
        //polygon (kapalı şekiller)(köşe noktaları tutuyoruz) 

    }
}
