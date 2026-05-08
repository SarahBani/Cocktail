import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ConflictException } from '@nestjs/common';
import { CocktailController } from '../src/cocktail/cocktail.controller';
import { CocktailService } from '../src/cocktail/cocktail.service';
import { HttpExceptionFilter } from '../src/http-exception.filter';

/**
 * Integration tests — boots a real NestJS HTTP app (no DB / ES required)
 * and exercises the full HTTP pipeline: routing, ParseIntPipe, exception filter,
 * serialization, and response shape.
 */

const mockCocktailService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const cocktailFixture = {
  id: 1,
  title: 'Mojito',
  description: 'A refreshing mint cocktail',
  price: 8.5,
};

describe('CocktailController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [CocktailController],
      providers: [{ provide: CocktailService, useValue: mockCocktailService }],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /cocktail', () => {
    it('should return 200 with an array of cocktails', async () => {
      mockCocktailService.findAll.mockResolvedValue([cocktailFixture]);

      const res = await request(app.getHttpServer())
        .get('/cocktail')
        .expect(200);

      expect(res.body).toEqual([cocktailFixture]);
    });

    it('should forward the search query param to the service', async () => {
      mockCocktailService.findAll.mockResolvedValue([cocktailFixture]);

      await request(app.getHttpServer())
        .get('/cocktail?search=mojito')
        .expect(200);

      expect(mockCocktailService.findAll).toHaveBeenCalledWith('mojito');
    });

    it('should return 200 with an empty array when nothing matches', async () => {
      mockCocktailService.findAll.mockResolvedValue([]);

      const res = await request(app.getHttpServer())
        .get('/cocktail?search=nonexistent')
        .expect(200);

      expect(res.body).toEqual([]);
    });
  });

  describe('GET /cocktail/:id', () => {
    it('should return 200 with the cocktail when it exists', async () => {
      mockCocktailService.findOne.mockResolvedValue(cocktailFixture);

      const res = await request(app.getHttpServer())
        .get('/cocktail/1')
        .expect(200);

      expect(res.body).toEqual(cocktailFixture);
      expect(mockCocktailService.findOne).toHaveBeenCalledWith(1);
    });

    it('should return 404 with a detail message when the cocktail does not exist', async () => {
      mockCocktailService.findOne.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .get('/cocktail/999')
        .expect(404);

      expect(res.body).toHaveProperty('detail');
      expect(res.body.detail).toContain('999');
    });

    it('should return 400 when the id is not a valid integer (ParseIntPipe)', async () => {
      await request(app.getHttpServer())
        .get('/cocktail/not-a-number')
        .expect(400);
    });
  });

  describe('POST /cocktail', () => {
    it('should return 201 when the cocktail is created', async () => {
      mockCocktailService.create.mockResolvedValue({ identifiers: [{ id: 2 }] });

      const res = await request(app.getHttpServer())
        .post('/cocktail')
        .send({ title: 'Daiquiri', description: 'Rum and lime', price: 9.0 })
        .expect(201);

      expect(res.body).toEqual({});
    });

    it('should return 409 with a detail message when the title already exists', async () => {
      mockCocktailService.create.mockRejectedValue(
        new ConflictException('A cocktail with title "Mojito" already exists'),
      );

      const res = await request(app.getHttpServer())
        .post('/cocktail')
        .send({ title: 'Mojito', description: 'Already exists', price: 8.5 })
        .expect(409);

      expect(res.body).toHaveProperty('detail');
      expect(res.body.detail).toContain('Mojito');
    });
  });

  describe('PUT /cocktail/:id', () => {
    it('should return 200 with the updated cocktail', async () => {
      const updated = { ...cocktailFixture, price: 10.0 };
      mockCocktailService.findOne.mockResolvedValue(cocktailFixture);
      mockCocktailService.update.mockResolvedValue(updated);

      const res = await request(app.getHttpServer())
        .put('/cocktail/1')
        .send({ title: 'Mojito', description: 'A refreshing mint cocktail', price: 10.0 })
        .expect(200);

      expect(res.body).toEqual(updated);
      expect(mockCocktailService.update).toHaveBeenCalledWith(1, {
        title: 'Mojito',
        description: 'A refreshing mint cocktail',
        price: 10.0,
      });
    });

    it('should return 404 when the cocktail does not exist', async () => {
      mockCocktailService.findOne.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .put('/cocktail/999')
        .send({ title: 'Ghost', description: 'Does not exist', price: 5.0 })
        .expect(404);

      expect(res.body).toHaveProperty('detail');
      expect(res.body.detail).toContain('999');
    });

    it('should return 400 when the id is not a valid integer (ParseIntPipe)', async () => {
      await request(app.getHttpServer())
        .put('/cocktail/not-a-number')
        .send({ title: 'Test', description: 'Test', price: 5.0 })
        .expect(400);
    });
  });

  describe('DELETE /cocktail/:id', () => {
    it('should return 204 when the cocktail is deleted', async () => {
      mockCocktailService.findOne.mockResolvedValue(cocktailFixture);
      mockCocktailService.delete.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .delete('/cocktail/1')
        .expect(204);

      expect(mockCocktailService.delete).toHaveBeenCalledWith(1);
    });

    it('should return 404 when the cocktail does not exist', async () => {
      mockCocktailService.findOne.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .delete('/cocktail/999')
        .expect(404);

      expect(res.body).toHaveProperty('detail');
      expect(res.body.detail).toContain('999');
    });

    it('should return 400 when the id is not a valid integer (ParseIntPipe)', async () => {
      await request(app.getHttpServer())
        .delete('/cocktail/not-a-number')
        .expect(400);
    });
  });
});
