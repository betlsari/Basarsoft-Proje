using BasarStajApp.DTOs;
using BasarStajApp.Entity;
using System.Collections.Generic;
using System.Linq;

namespace BasarStajApp.Services
{
    public class StaticList : IFeatureService
    {
        private readonly List<Feature> _points = new List<Feature>();
        private int _nextId = 1;

        public Feature Add(FeatureDTO dto)
        {
            var point = new Feature
            {
                Id = _nextId++,
                Name = dto.Name,
                WKT = dto.WKT
            };
            _points.Add(point);
            return point;
        }

        public List<Feature> AddRange(List<FeatureDTO> dtos)
        {
            var newPoints = dtos.Select(dto => new Feature
            {
                Id = _nextId++,
                Name = dto.Name,
                WKT = dto.WKT
            }).ToList();

            _points.AddRange(newPoints);
            return newPoints;
        }

        public List<Feature> GetAll() => _points;

        public Feature GetByID(int id)
        {
            return _points.FirstOrDefault(p => p.Id == id);
        }

        public Feature Update(int id, FeatureDTO dto)
        {
            var point = _points.FirstOrDefault(p => p.Id == id);
            if (point == null) return null;

            point.Name = dto.Name;
            point.WKT = dto.WKT;
            return point;
        }

        public bool Delete(int id)
        {
            var point = _points.FirstOrDefault(p => p.Id == id);
            if (point == null) return false;

            _points.Remove(point);
            return true;
        }
    }
}
