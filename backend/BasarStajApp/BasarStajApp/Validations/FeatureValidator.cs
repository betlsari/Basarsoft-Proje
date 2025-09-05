using BasarStajApp.DTOs;
using NetTopologySuite.IO;
using System.Collections.Generic;

namespace BasarStajApp.Validators
{
    public static class FeatureValidator
    {
        public static (bool IsValid, string ErrorMessage) Validate(FeatureDTO dto)
        {
            if (dto == null)
                return (false, "DTO boş olamaz.");

            if (string.IsNullOrWhiteSpace(dto.Name))
                return (false, "Name boş olamaz.");

            if (dto.Name.Length > 50)
                return (false, "Name 50 karakterden uzun olamaz.");

            if (string.IsNullOrWhiteSpace(dto.WKT))
                return (false, "WKT boş olamaz.");

            if (!IsValidGeometry(dto.WKT))
                return (false, "Geçersiz WKT formatı.");

            return (true, "");
        }

        public static (bool IsValid, string ErrorMessage) Validate(List<FeatureDTO> dtos)
        {
            if (dtos == null || dtos.Count == 0)
                return (false, "Liste boş olamaz.");

            foreach (var dto in dtos)
            {
                var result = Validate(dto);
                if (!result.IsValid)
                    return (false, $"Hata WKT: {dto.WKT} → {result.ErrorMessage}");
            }

            return (true, "");
        }

        private static bool IsValidGeometry(string wkt)
        {
            try
            {
                var reader = new WKTReader();
                var geom = reader.Read(wkt);
                return geom.IsValid;
            }
            catch
            {
                return false;
            }
        }
    }
}
