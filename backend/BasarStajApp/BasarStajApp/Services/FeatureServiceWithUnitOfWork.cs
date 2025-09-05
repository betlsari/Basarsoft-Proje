using BasarStajApp.DTOs;
using BasarStajApp.Entity;
using BasarStajApp.UnitOfWork;
using NetTopologySuite.IO;
using NetTopologySuite.Geometries;
using System;
using System.Collections.Generic;
using System.Linq;

namespace BasarStajApp.Services
{
    public class FeatureServiceWithUnitOfWork : IFeatureService
    {
        private readonly IUnitOfWork _unitOfWork;

        public FeatureServiceWithUnitOfWork(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public Feature Add(FeatureDTO dto)
        {
            if (dto == null) throw new ArgumentNullException(nameof(dto));

            var reader = new WKTReader();
            Geometry geometry;

            try
            {
                geometry = !string.IsNullOrWhiteSpace(dto.WKT)
                    ? reader.Read(dto.WKT)  // artık sadece Geometry, cast yok
                    : reader.Read("POINT(0 0)");

                geometry.SRID = 4326;
            }
            catch (Exception ex)
            {
                throw new FormatException("Geçersiz WKT formatı.", ex);
            }

            var feature = new Feature
            {
                Name = dto.Name,
                Location = geometry,  // Geometry tipi
                WKT = new WKTWriter().Write(geometry)
            };

            _unitOfWork.FeatureRepository.Add(feature);
            _unitOfWork.Complete();

            return feature;
        }

        public List<Feature> AddRange(List<FeatureDTO> dtos)
        {
            var reader = new WKTReader();
            var features = dtos.Select(dto =>
            {
                Geometry geometry;
                try
                {
                    geometry = !string.IsNullOrWhiteSpace(dto.WKT)
                        ? reader.Read(dto.WKT)
                        : reader.Read("POINT(0 0)");
                    geometry.SRID = 4326;
                }
                catch
                {
                    geometry = reader.Read("POINT(0 0)");
                    geometry.SRID = 4326;
                }

                return new Feature
                {
                    Name = dto.Name,
                    Location = geometry,
                    WKT = new WKTWriter().Write(geometry)
                };
            }).ToList();

            _unitOfWork.FeatureRepository.AddRange(features);
            _unitOfWork.Complete();
            return features;
        }

        public Feature Update(int id, FeatureDTO dto)
        {
            var feature = _unitOfWork.FeatureRepository.GetById(id);
            if (feature == null) return null;

            var reader = new WKTReader();
            Geometry geometry;
            try
            {
                geometry = !string.IsNullOrWhiteSpace(dto.WKT)
                    ? reader.Read(dto.WKT)
                    : feature.Location ?? reader.Read("POINT(0 0)");

                geometry.SRID = 4326;
            }
            catch
            {
                geometry = feature.Location ?? reader.Read("POINT(0 0)");
                geometry.SRID = 4326;
            }

            feature.Name = dto.Name;
            feature.Location = geometry;
            feature.WKT = new WKTWriter().Write(geometry);

            _unitOfWork.FeatureRepository.Update(feature);
            _unitOfWork.Complete();

            return feature;
        }

        public bool Delete(int id)
        {
            var feature = _unitOfWork.FeatureRepository.GetById(id);
            if (feature == null) return false;

            _unitOfWork.FeatureRepository.Delete(id);
            _unitOfWork.Complete();
            return true;
        }

        public List<Feature> GetAll() => _unitOfWork.FeatureRepository.GetAll().ToList();

        public Feature GetByID(int id) => _unitOfWork.FeatureRepository.GetById(id);
    }
}
