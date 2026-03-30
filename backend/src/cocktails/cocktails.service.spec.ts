import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException } from '@nestjs/common';
import { CocktailsService } from './cocktails.service';
import { Cocktails } from './cocktails.entity';
import { ElasticSearch } from '../elasticsearch.service';

const mockQueryBuilder = {
  where: jest.fn().mockReturnThis(),
  getMany: jest.fn(),
};

const mockRepository = {
  find: jest.fn(),
  findOneBy: jest.fn(),
  insert: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
};

const mockElasticSearch = {
  bulkIndex: jest.fn(),
  indexCocktail: jest.fn(),
  fuzzySearch: jest.fn(),
};

const cocktailFixture: Cocktails = {
  id: 1,
  title: 'Mojito',
  description: 'A refreshing mint cocktail',
  price: 8.5,
};

describe('CocktailsService', () => {
  let service: CocktailsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CocktailsService,
        { provide: getRepositoryToken(Cocktails), useValue: mockRepository },
        { provide: ElasticSearch, useValue: mockElasticSearch },
      ],
    }).compile();

    service = module.get<CocktailsService>(CocktailsService);
    jest.clearAllMocks();
    mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.where.mockReturnThis();
  });

  describe('onModuleInit', () => {
    it('should bulk-index all cocktails in Elasticsearch on startup', async () => {
      mockRepository.find.mockResolvedValue([cocktailFixture]);
      mockElasticSearch.bulkIndex.mockResolvedValue(undefined);

      await service.onModuleInit();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(mockElasticSearch.bulkIndex).toHaveBeenCalledWith([cocktailFixture]);
    });

    it('should not throw when Elasticsearch sync fails on startup', async () => {
      mockRepository.find.mockResolvedValue([cocktailFixture]);
      mockElasticSearch.bulkIndex.mockRejectedValue(new Error('ES unavailable'));

      await expect(service.onModuleInit()).resolves.not.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return all cocktails from the database when no search term is given', async () => {
      mockRepository.find.mockResolvedValue([cocktailFixture]);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual([cocktailFixture]);
    });

    it('should search Elasticsearch and return cocktails by IDs when a term is provided', async () => {
      mockElasticSearch.fuzzySearch.mockResolvedValue([1]);
      mockQueryBuilder.getMany.mockResolvedValue([cocktailFixture]);

      const result = await service.findAll('mojito');

      expect(mockElasticSearch.fuzzySearch).toHaveBeenCalledWith('mojito');
      expect(mockRepository.createQueryBuilder).toHaveBeenCalled();
      expect(result).toEqual([cocktailFixture]);
    });

    it('should fall back to DB LIKE query when Elasticsearch returns no IDs', async () => {
      mockElasticSearch.fuzzySearch.mockResolvedValue([]);
      mockQueryBuilder.getMany.mockResolvedValue([cocktailFixture]);

      const result = await service.findAll('mojito');

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'LOWER(cocktail.title) LIKE :search OR LOWER(cocktail.description) LIKE :search',
        { search: '%mojito%' },
      );
      expect(result).toEqual([cocktailFixture]);
    });

    it('should fall back to DB LIKE query when Elasticsearch throws', async () => {
      mockElasticSearch.fuzzySearch.mockRejectedValue(new Error('ES down'));
      mockQueryBuilder.getMany.mockResolvedValue([cocktailFixture]);

      const result = await service.findAll('mojito');

      expect(mockQueryBuilder.where).toHaveBeenCalled();
      expect(result).toEqual([cocktailFixture]);
    });

    it('should lowercase the search term when building the fallback DB query', async () => {
      mockElasticSearch.fuzzySearch.mockResolvedValue([]);
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await service.findAll('MOJITO');

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        expect.any(String),
        { search: '%mojito%' },
      );
    });
  });

  describe('findOne', () => {
    it('should return a cocktail when it exists', async () => {
      mockRepository.findOneBy.mockResolvedValue(cocktailFixture);

      const result = await service.findOne(1);

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(cocktailFixture);
    });

    it('should return null when the cocktail does not exist', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    const newCocktail = { title: 'Daiquiri', description: 'Rum and lime', price: 9.0 } as Cocktails;

    it('should insert the cocktail and index it in Elasticsearch', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);
      mockRepository.insert.mockResolvedValue({ identifiers: [{ id: 5 }] });
      mockElasticSearch.indexCocktail.mockResolvedValue(undefined);

      const result = await service.create(newCocktail);

      expect(mockRepository.insert).toHaveBeenCalledWith(newCocktail);
      expect(mockElasticSearch.indexCocktail).toHaveBeenCalledWith({
        id: 5,
        title: 'Daiquiri',
        description: 'Rum and lime',
      });
      expect(result).toEqual({ identifiers: [{ id: 5 }] });
    });

    it('should throw ConflictException when a cocktail with the same title already exists', async () => {
      mockRepository.findOneBy.mockResolvedValue({ ...newCocktail, id: 3 });

      await expect(service.create(newCocktail)).rejects.toThrow(ConflictException);
      expect(mockRepository.insert).not.toHaveBeenCalled();
    });

    it('should not throw when Elasticsearch indexing fails after insert', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);
      mockRepository.insert.mockResolvedValue({ identifiers: [{ id: 5 }] });
      mockElasticSearch.indexCocktail.mockRejectedValue(new Error('ES down'));

      await expect(service.create(newCocktail)).resolves.not.toThrow();
    });
  });
});
