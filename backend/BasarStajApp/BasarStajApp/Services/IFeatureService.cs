
using BasarStajApp.DTOs;
using BasarStajApp.Entity;

namespace BasarStajApp.Services
{
    public interface IFeatureService
    {
        Feature Add(FeatureDTO dto);
        List<Feature> AddRange(List<FeatureDTO> dtos);
        Feature Update(int id, FeatureDTO dto);
        bool Delete(int id);
        List<Feature> GetAll();
        Feature GetByID(int id);
    }
}

