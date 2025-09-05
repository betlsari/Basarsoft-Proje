using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using BasarStajApp.Entity;

namespace BasarStajApp
{
    public class AppDbContext : DbContext
    {
        public DbSet<Feature> Features { get; set; }

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Feature>()
                .Property(f => f.Location)
                .HasColumnType("geometry"); // PostGIS tüm Geometry tiplerini destekler
        }

    }
}
