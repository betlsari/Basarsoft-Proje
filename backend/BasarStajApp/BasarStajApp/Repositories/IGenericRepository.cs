using System.Collections.Generic;

namespace BasarStajApp.Repositories
{
    public interface IGenericRepository<T> where T : class
    {
        T Add(T entity);
        void AddRange(List<T> entities);
        T Update(T entity);
        T GetById(int id);
        List<T> GetAll();
        bool Delete(int id);
    }
}
