using BasarStajApp.DTOs;
using BasarStajApp.Entity;
using NetTopologySuite.Geometries;
using NetTopologySuite.IO;
using System.Collections.Generic;
using System.Linq;

namespace BasarStajApp.Services
{
    public class FeatureServiceWithEntityFramework : IFeatureService
    {
        private readonly AppDbContext _context;

        public FeatureServiceWithEntityFramework(AppDbContext context)
        {
            _context = context;
        }

        
        private Feature MapDtoToEntity(FeatureDTO dto)
        {
            var reader = new WKTReader();
            var point = (Point)reader.Read(dto.WKT);

            return new Feature
            {
                Name = dto.Name,
                Location = point
            };
        }

        
        private FeatureDTO MapEntityToDto(Feature feature)
        {
            var writer = new WKTWriter();
            return new FeatureDTO
            {
                Name = feature.Name,
                WKT = writer.Write(feature.Location)
            };
        }

        public Feature Add(FeatureDTO dto)
        {
            var feature = MapDtoToEntity(dto);
            _context.Features.Add(feature);
            _context.SaveChanges();
            return feature;
        }

        public List<Feature> AddRange(List<FeatureDTO> dtos)
        {
            var features = dtos.Select(MapDtoToEntity).ToList();
            _context.Features.AddRange(features);
            _context.SaveChanges();
            return features;
        }

        public Feature Update(int id, FeatureDTO dto)
        {
            var feature = _context.Features.Find(id);
            if (feature == null) return null;

            var updatedFeature = MapDtoToEntity(dto);
            feature.Name = updatedFeature.Name;
            feature.Location = updatedFeature.Location;

            _context.SaveChanges();
            return feature;
        }

        public List<Feature> GetAll() => _context.Features.ToList();

        public Feature GetByID(int id) => _context.Features.Find(id);

        public bool Delete(int id)
        {
            var feature = _context.Features.Find(id);
            if (feature == null) return false;

            _context.Features.Remove(feature);
            _context.SaveChanges();
            return true;
        }
    }
}
