import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ConflictException } from '@nestjs/common';
import { CocktailsController } from '../src/cocktails/cocktails.controller';
import { CocktailsService } from '../src/cocktails/cocktails.service';
import { HttpExceptionFilter } from '../src/http-exception.filter';

/**
 * Integration tests — boots a real NestJS HTTP app (no DB / ES required)
 * and exercises the full HTTP pipeline: routing, ParseIntPipe, exception filter,
 * serialization, and response shape.
 */

const mockCocktailsService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
};

const cocktailFixture = {
  id: 1,
  title: 'Mojito',
  description: 'A refreshing mint cocktail',
  price: 8.5,
};

describe('CocktailsController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [CocktailsController],
      providers: [{ provide: CocktailsService, useValue: mockCocktailsService }],
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

  describe('GET /cocktails', () => {
    it('should return 200 with an array of cocktails', async () => {
      mockCocktailsService.findAll.mockResolvedValue([cocktailFixture]);

      const res = await request(app.getHttpServer())
        .get('/cocktails')
        .expect(200);

      expect(res.body).toEqual([cocktailFixture]);
    });

    it('should forward the search query param to the service', async () => {
      mockCocktailsService.findAll.mockResolvedValue([cocktailFixture]);

      await request(app.getHttpServer())
        .get('/cocktails?search=mojito')
        .expect(200);

      expect(mockCocktailsService.findAll).toHaveBeenCalledWith('mojito');
    });

    it('should return 200 with an empty array when nothing matches', async () => {
      mockCocktailsService.findAll.mockResolvedValue([]);

      const res = await request(app.getHttpServer())
        .get('/cocktails?search=nonexistent')
        .expect(200);

      expect(res.body).toEqual([]);
    });
  });

  describe('GET /cocktails/:id', () => {
    it('should return 200 with the cocktail when it exists', async () => {
      mockCocktailsService.findOne.mockResolvedValue(cocktailFixture);

      const res = await request(app.getHttpServer())
        .get('/cocktails/1')
        .expect(200);

      expect(res.body).toEqual(cocktailFixture);
      expect(mockCocktailsService.findOne).toHaveBeenCalledWith(1);
    });

    it('should return 404 with a detail message when the cocktail does not exist', async () => {
      mockCocktailsService.findOne.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .get('/cocktails/999')
        .expect(404);

      expect(res.body).toHaveProperty('detail');
      expect(res.body.detail).toContain('999');
    });

    it('should return 400 when the id is not a valid integer (ParseIntPipe)', async () => {
      await request(app.getHttpServer())
        .get('/cocktails/not-a-number')
        .expect(400);
    });
  });

  describe('POST /cocktails', () => {
    it('should return 201 with true when the cocktail is created', async () => {
      mockCocktailsService.create.mockResolvedValue({ identifiers: [{ id: 2 }] });

      const res = await request(app.getHttpServer())
        .post('/cocktails')
        .send({ title: 'Daiquiri', description: 'Rum and lime', price: 9.0 })
        .expect(201);

      expect(res.body).toBe(true);
    });

    it('should return 409 with a detail message when the title already exists', async () => {
      mockCocktailsService.create.mockRejectedValue(
        new ConflictException('A cocktail with title "Mojito" already exists'),
      );

      const res = await request(app.getHttpServer())
        .post('/cocktails')
        .send({ title: 'Mojito', description: 'Already exists', price: 8.5 })
        .expect(409);

      expect(res.body).toHaveProperty('detail');
      expect(res.body.detail).toContain('Mojito');
    });
  });
});
