using BasarStajApp.Entity;
using BasarStajApp.Repositories;
using System;

namespace BasarStajApp.UnitOfWork
{
    public interface IUnitOfWork : IDisposable
    {
        IGenericRepository<Feature> FeatureRepository { get; }
        int Complete();
    }
}
