using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;

namespace BasarStajApp.Repositories
{
    public class GenericRepository<T> : IGenericRepository<T> where T : class
    {
        private readonly AppDbContext _context;
        private readonly DbSet<T> _dbSet;

        public GenericRepository(AppDbContext context)
        {
            _context = context;
            _dbSet = context.Set<T>();
        }

        public T Add(T entity)
        {
            _dbSet.Add(entity);
            _context.SaveChanges();
            return entity;
        }

        public void AddRange(List<T> entities)
        {
            _dbSet.AddRange(entities);
        }


        public T Update(T entity)
        {
            _dbSet.Update(entity);
            _context.SaveChanges();
            return entity;
        }

        public T GetById(int id) => _dbSet.Find(id);

        public List<T> GetAll() => _dbSet.ToList();

        public bool Delete(int id)
        {
            var entity = _dbSet.Find(id);
            if (entity == null)
                return false;

            _dbSet.Remove(entity);
            _context.SaveChanges();
            return true;
        }

       
    }
}
