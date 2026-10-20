import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { PaginationQueryDto } from './pagination.dto.js';

describe('PaginationQueryDto', () => {
  it('accepts an empty query', async () => {
    const dto = plainToInstance(PaginationQueryDto, {});
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects out-of-range limit', async () => {
    const dto = plainToInstance(PaginationQueryDto, { limit: '9999' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
