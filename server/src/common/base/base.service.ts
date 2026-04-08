// ─────────────────────────────────────────────────────────
// BaseService — TEMPLATE METHOD PATTERN
// ─────────────────────────────────────────────────────────
// Abstract service class that defines a skeleton algorithm
// for CRUD operations. Subclasses can override hook methods
// (beforeCreate, afterCreate, beforeUpdate, afterUpdate)
// to inject custom logic without changing the overall flow.
// ─────────────────────────────────────────────────────────

import { BaseRepository } from './base.repository';

export abstract class BaseService<T, CreateInput, UpdateInput> {
  constructor(protected readonly repository: BaseRepository<T, CreateInput, UpdateInput>) {}

  // ── Template Method: Create ──
  async create(data: CreateInput): Promise<T> {
    await this.beforeCreate(data);
    const entity = await this.repository.create(data);
    await this.afterCreate(entity);
    return entity;
  }

  // ── Template Method: Update ──
  async update(id: string, data: UpdateInput): Promise<T> {
    await this.beforeUpdate(id, data);
    const entity = await this.repository.update(id, data);
    await this.afterUpdate(entity);
    return entity;
  }

  // ── Standard operations (no hooks needed) ──
  async findAll(where?: any, include?: any): Promise<T[]> {
    return this.repository.findAll(where, include);
  }

  async findById(id: string, include?: any): Promise<T | null> {
    return this.repository.findById(id, include);
  }

  async findOne(where: any, include?: any): Promise<T | null> {
    return this.repository.findOne(where, include);
  }

  async delete(id: string): Promise<T> {
    return this.repository.delete(id);
  }

  // ── Hook methods — override in subclasses ──
  protected async beforeCreate(_data: CreateInput): Promise<void> {}
  protected async afterCreate(_entity: T): Promise<void> {}
  protected async beforeUpdate(_id: string, _data: UpdateInput): Promise<void> {}
  protected async afterUpdate(_entity: T): Promise<void> {}
}
