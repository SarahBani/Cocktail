import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CocktailsController } from './cocktails.controller';
import { CocktailsService } from './cocktails.service';
import { Cocktails } from './cocktails.entity';

const mockCocktailsService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
};

const cocktailFixture: Cocktails = {
  id: 1,
  title: 'Mojito',
  description: 'A refreshing mint cocktail',
  price: 8.5,
};

describe('CocktailsController', () => {
  let controller: CocktailsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CocktailsController],
      providers: [{ provide: CocktailsService, useValue: mockCocktailsService }],
    }).compile();

    controller = module.get<CocktailsController>(CocktailsController);
    jest.clearAllMocks();
  });

  describe('searchCocktails', () => {
    it('should return all cocktails when no search query is provided', async () => {
      mockCocktailsService.findAll.mockResolvedValue([cocktailFixture]);

      const result = await controller.searchCocktails(undefined);

      expect(mockCocktailsService.findAll).toHaveBeenCalledWith(undefined);
      expect(result).toEqual([cocktailFixture]);
    });

    it('should pass the search term to the service', async () => {
      mockCocktailsService.findAll.mockResolvedValue([cocktailFixture]);

      const result = await controller.searchCocktails('mojito');

      expect(mockCocktailsService.findAll).toHaveBeenCalledWith('mojito');
      expect(result).toEqual([cocktailFixture]);
    });

    it('should return an empty array when no cocktails match the search', async () => {
      mockCocktailsService.findAll.mockResolvedValue([]);

      const result = await controller.searchCocktails('unknown');

      expect(result).toEqual([]);
    });
  });

  describe('getCocktail', () => {
    it('should return a cocktail when it exists', async () => {
      mockCocktailsService.findOne.mockResolvedValue(cocktailFixture);

      const result = await controller.getCocktail(1);

      expect(mockCocktailsService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(cocktailFixture);
    });

    it('should throw NotFoundException when the cocktail does not exist', async () => {
      mockCocktailsService.findOne.mockResolvedValue(null);

      await expect(controller.getCocktail(999)).rejects.toThrow(NotFoundException);
      await expect(controller.getCocktail(999)).rejects.toThrow('Cocktail with id 999 not found');
    });
  });

  describe('newCocktail', () => {
    it('should call service.create and return true on success', async () => {
      const payload = { title: 'Daiquiri', description: 'Rum and lime', price: 9.0 } as Cocktails;
      mockCocktailsService.create.mockResolvedValue({ identifiers: [{ id: 2 }] });

      const result = await controller.newCocktail(payload);

      expect(mockCocktailsService.create).toHaveBeenCalledWith(payload);
      expect(result).toBe(true);
    });

    it('should propagate exceptions thrown by the service', async () => {
      const payload = { title: 'Mojito', description: 'Already exists', price: 8.5 } as Cocktails;
      mockCocktailsService.create.mockRejectedValue(
        new Error('A cocktail with title "Mojito" already exists'),
      );

      await expect(controller.newCocktail(payload)).rejects.toThrow();
    });
  });
});
