using BasarStajApp.Entity;
using BasarStajApp.Repositories;
using System;

namespace BasarStajApp.UnitOfWork
{
    public class UnitOfWork : IUnitOfWork, IDisposable //disposable kısmı context işi bittiğinde doğru şekilde kapatılmasını sağlıyor 
    {
        private readonly AppDbContext _context;
        private GenericRepository<Feature> _featureRepository;

        public UnitOfWork(AppDbContext context)
        {
            _context = context;
        }

       
        public IGenericRepository<Feature> FeatureRepository
            => _featureRepository ??= new GenericRepository<Feature>(_context);

        
        public int Complete()
        {
            return _context.SaveChanges();
        }

        
        private bool _disposed = false;
        protected virtual void Dispose(bool disposing)
        {
            if (!_disposed)
            {
                if (disposing)
                {
                    _context.Dispose();
                }
                _disposed = true;
            }
        }

        public void Dispose()
        {
            Dispose(true); //burada da belleği boşaltıyoruz
            GC.SuppressFinalize(this);
        }
    }
}
//dispose : bir nesnenin kullandığı kaynakları serbest bırakması