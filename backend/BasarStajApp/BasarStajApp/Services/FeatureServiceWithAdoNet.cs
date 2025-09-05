using BasarStajApp.DTOs;
using BasarStajApp.Entity;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Security.Cryptography;


namespace BasarStajApp.Services
{
    public class FeatureServiceWithAdoNet : IFeatureService
    {
        private readonly string _connectionString;


        public FeatureServiceWithAdoNet(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }
        public Feature Add(FeatureDTO dto)
        {
            using (var con = new NpgsqlConnection(_connectionString))
            {
                con.Open();
                string sql = @"INSERT INTO ""Points"" (""Name"", ""WKT"", geom) 
                       VALUES (@Name, @WKT, ST_GeomFromText(@WKT, 4326)) 
                       RETURNING ""Id""";

                using (var cmd = new NpgsqlCommand(sql, con))
                {
                    cmd.Parameters.AddWithValue("@Name", dto.Name);
                    cmd.Parameters.AddWithValue("@WKT", dto.WKT);

                    int newId = (int)cmd.ExecuteScalar();
                    return new Feature { Id = newId, Name = dto.Name, WKT = dto.WKT };
                }
            }


        }

        public List<Feature> AddRange(List<FeatureDTO> dtos)
        {
            var result = new List<Feature>();
            using (var con = new NpgsqlConnection(_connectionString))
            {
                con.Open();
                foreach (var dto in dtos)
                {
                    string sql = "INSERT INTO \"Points\" (Name,WKT) Values (@Name,@WKT) RETURNING Id";
                    using (var cmd = new NpgsqlCommand(sql, con))
                    {
                        cmd.Parameters.AddWithValue("@Name", dto.Name);
                        cmd.Parameters.AddWithValue("@WKT", dto.WKT);

                        int newId = (int)cmd.ExecuteScalar();
                        result.Add(new Feature
                        {
                            Id = newId,
                            Name = dto.Name,
                            WKT = dto.WKT
                        });
                    }
                }
            }
            return result;
        }

        public List<Feature> GetAll()
        {
            var points = new List<Feature>();
            using (var con = new NpgsqlConnection(_connectionString))
            {
                con.Open();
                string sql = "SELECT \"Id\", \"Name\", \"WKT\" FROM \"Points\"";
                using (var cmd = new NpgsqlCommand(sql, con))
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        points.Add(new Feature
                        {
                            Id = reader.GetInt32(0),
                            Name = reader.GetString(1),
                            WKT = reader.GetString(2)
                        });

                    }
                }

            }
            return points;
        }

        public Feature GetByID(int id)
        {
            using (var con = new NpgsqlConnection(_connectionString))
            {
                con.Open();
                string sql = "SELECT \"Id\", \"Name\", \"WKT\" FROM \"Points\" WHERE \"Id\" = @Id";
                using (var cmd = new NpgsqlCommand(sql, con))
                {
                    cmd.Parameters.AddWithValue("@Id", id);
                    using (var reader = cmd.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            return new Feature
                            {
                                Id = reader.GetInt32(0),
                                Name = reader.GetString(1),
                                WKT = reader.GetString(2)
                            };
                        }
                    }
                }
            }
            return null;
        }

        public Feature Update(int id, FeatureDTO dto)
        {
            using var con = new NpgsqlConnection(_connectionString);
            con.Open();

            string sql = @"UPDATE ""Points"" 
                       SET ""Name""=@Name, ""WKT""=@WKT, geom=ST_GeomFromText(@WKT, 4326) 
                       WHERE ""Id""=@Id";

            using var cmd = new NpgsqlCommand(sql, con);
            cmd.Parameters.AddWithValue("@Name", dto.Name);
            cmd.Parameters.AddWithValue("@WKT", dto.WKT);
            cmd.Parameters.AddWithValue("@Id", id);

            cmd.ExecuteNonQuery();
            return new Feature { Id = id, Name = dto.Name, WKT = dto.WKT };
        }
    

        public bool Delete(int id)
        {
            using (var con = new NpgsqlConnection(_connectionString))
            {
                con.Open();
                string sql = "DELETE FROM \"Points\" WHERE \"Id\"=@Id";

                using (var cmd = new NpgsqlCommand(sql, con))
                {
                    cmd.Parameters.AddWithValue("@Id", id);
                    int rows = cmd.ExecuteNonQuery();
                    return rows > 0;
                }
            }
        }
    }
}
