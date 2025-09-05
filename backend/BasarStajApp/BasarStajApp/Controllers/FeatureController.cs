using BasarStajApp.DTOs;
using BasarStajApp.Entity;
using BasarStajApp.Resources;
using BasarStajApp.Resources.BasarStajApp.Resources;
using BasarStajApp.Services;
using BasarStajApp.Validators;
using Microsoft.AspNetCore.Mvc;
using NetTopologySuite.Geometries;
using NetTopologySuite.IO;
using System.Collections.Generic;
using System.Linq;

namespace BasarStajApp.Controllers
{
    [ApiController]
    [Route("api/[controller]/[action]")]
    public class FeatureController : ControllerBase
    {
        private readonly IFeatureService _featureService;

        public FeatureController(IFeatureService featureService)
        {
            _featureService = featureService;
        }

        [HttpPost]
        public ActionResult<ApiResponse<FeatureDTO>> Add(FeatureDTO dto)
        {
            var validation = FeatureValidator.Validate(dto);
            if (!validation.IsValid)
                return BadRequest(new ApiResponse<object>(false, validation.ErrorMessage, null));

            var addedEntity = _featureService.Add(dto);
            if (addedEntity == null)
                return BadRequest(new ApiResponse<object>(false, Messages.ValidationError, null));

            return Ok(new ApiResponse<FeatureDTO>(true, Messages.PointAdded, MapEntityToDto(addedEntity)));
        }

        [HttpPut("Update/{id}")]
        public ActionResult<ApiResponse<FeatureDTO>> Update(int id, FeatureDTO dto)
        {
            var validation = FeatureValidator.Validate(dto);
            if (!validation.IsValid)
                return BadRequest(new ApiResponse<object>(false, validation.ErrorMessage, null));

            var updatedEntity = _featureService.Update(id, dto);
            if (updatedEntity == null)
                return NotFound(new ApiResponse<object>(false, Messages.PointNotFound, null));

            return Ok(new ApiResponse<FeatureDTO>(true, Messages.PointUpdated, MapEntityToDto(updatedEntity)));
        }

        [HttpGet("GetAll")] // artık sadece bir kez GetAll 
        public ActionResult<ApiResponse<List<FeatureDTO>>> GetAll(int page = 1, int pageSize = 1000)
        {
            page = page < 1 ? 1 : page;
            pageSize = pageSize < 1 ? 10 : pageSize;

            var allEntities = _featureService.GetAll().OrderBy(f => f.Id).ToList();
            var totalCount = allEntities.Count;


            var pagedEntities = allEntities.Skip((page - 1) * pageSize).Take(pageSize).ToList();
            var dtos = pagedEntities.Select(MapEntityToDto).ToList();

            return Ok(new ApiResponse<List<FeatureDTO>>(
                true,
                "",
                dtos, 
                new
                {
                    Count = totalCount,
                    Page = page,
                    PageSize = pageSize,
                    TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
                }
            ));
        }
        [HttpGet("{id}")]
        public ActionResult<ApiResponse<FeatureDTO>> GetByID(int id)
        {
            var entity = _featureService.GetByID(id);
            if (entity == null)
                return NotFound(new ApiResponse<object>(false, Messages.PointNotFound, null));

            return Ok(new ApiResponse<FeatureDTO>(true, "", MapEntityToDto(entity)));
        }

        [HttpDelete("{id}")]
        public ActionResult<ApiResponse<object>> Delete(int id)
        {
            var deleted = _featureService.Delete(id);
            if (!deleted)
                return NotFound(new ApiResponse<object>(false, Messages.PointNotFound, null));

            return Ok(new ApiResponse<object>(true, Messages.PointDeleted, null));
        }

        private FeatureDTO MapEntityToDto(Feature feature)
        {
            if (feature == null) return null;
            return new FeatureDTO
            {
                ID = feature.Id,
                Name = feature.Name,
                WKT = feature.Location != null ? new WKTWriter().Write(feature.Location) : null
            };
        }
    }
}
