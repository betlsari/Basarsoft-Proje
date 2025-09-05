using BasarStajApp;
using BasarStajApp.Entity;
using BasarStajApp.Services;
using BasarStajApp.UnitOfWork;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using System.Text.Json;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Servis kay�tlar�
//builder.Services.AddScoped<IPointService, PointServiceWithAdoNet>();
//builder.Services.AddScoped<IPointService, PointServiceWithEntityFramework>(); //db context ile �a��rd���m�z k�s�m
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>(); //unit of work k�sm�n� da burdan �a��r�yorum
builder.Services.AddScoped<IFeatureService, FeatureServiceWithUnitOfWork>();
//builder.Services.AddSingleton<IPointService, StaticList>();

// DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        npgsqlOptions => npgsqlOptions.UseNetTopologySuite()
    )
);
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(
        policy =>
        {
            policy.WithOrigins("http://localhost:3000", "http://localhost:5173") // React uygulaman�z�n URL'sini buraya ekleyin
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins",
        policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Encoder = System.Text.Encodings.Web.JavaScriptEncoder.Create(System.Text.Unicode.UnicodeRanges.All);
    });

// CORS ayarlar�
var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

builder.Services.AddCors(options =>
{
    // T�m originlere izin ver
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });

    // React frontend i�in �zel policy
    options.AddPolicy("AllowReact", policy =>
    {
        policy.WithOrigins("http://localhost:3000") // React app adresi
              .AllowAnyHeader()
              .AllowAnyMethod();
    });

    // �zel isimlendirilmi� policy
    options.AddPolicy(name: MyAllowSpecificOrigins, policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// JSON ayarlar�
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.NumberHandling = JsonNumberHandling.AllowNamedFloatingPointLiterals;
    });

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "My API", Version = "v1" });
});

var app = builder.Build();

// Middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// CORS middleware
app.UseCors("AllowAll"); // sadece bir policy kullanmak yeterli

app.UseHttpsRedirection();
app.UseAuthorization();

app.MapControllers();

app.Run();
