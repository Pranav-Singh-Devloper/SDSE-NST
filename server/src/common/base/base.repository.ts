// ─────────────────────────────────────────────────────────
// BaseRepository — Generic Repository Abstraction
// ─────────────────────────────────────────────────────────
// Provides a thin abstraction over Prisma model delegates.
// Each concrete repository passes its Prisma delegate
// to get standard CRUD operations for free.
// ─────────────────────────────────────────────────────────

export abstract class BaseRepository<T, CreateInput, UpdateInput> {
  protected abstract get model(): any;

  async findAll(where?: any, include?: any): Promise<T[]> {
    return this.model.findMany({ where, include });
  }

  async findById(id: string, include?: any): Promise<T | null> {
    return this.model.findUnique({ where: { id }, include });
  }

  async findOne(where: any, include?: any): Promise<T | null> {
    return this.model.findFirst({ where, include });
  }

  async create(data: CreateInput, include?: any): Promise<T> {
    return this.model.create({ data, include });
  }

  async update(id: string, data: UpdateInput, include?: any): Promise<T> {
    return this.model.update({ where: { id }, data, include });
  }

  async delete(id: string): Promise<T> {
    return this.model.delete({ where: { id } });
  }

  async count(where?: any): Promise<number> {
    return this.model.count({ where });
  }
}
