import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CocktailController } from './cocktail.controller';
import { CocktailService } from './cocktail.service';
import { Cocktail } from './cocktail.entity';

const mockCocktailService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const cocktailFixture: Cocktail = {
  id: 1,
  title: 'Mojito',
  description: 'A refreshing mint cocktail',
  price: 8.5,
};

describe('CocktailController', () => {
  let controller: CocktailController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CocktailController],
      providers: [{ provide: CocktailService, useValue: mockCocktailService }],
    }).compile();

    controller = module.get<CocktailController>(CocktailController);
    jest.clearAllMocks();
  });

  describe('searchCocktail', () => {
    it('should return all cocktails when no search query is provided', async () => {
      mockCocktailService.findAll.mockResolvedValue([cocktailFixture]);

      const result = await controller.searchCocktail(undefined);

      expect(mockCocktailService.findAll).toHaveBeenCalledWith(undefined);
      expect(result).toEqual([cocktailFixture]);
    });

    it('should pass the search term to the service', async () => {
      mockCocktailService.findAll.mockResolvedValue([cocktailFixture]);

      const result = await controller.searchCocktail('mojito');

      expect(mockCocktailService.findAll).toHaveBeenCalledWith('mojito');
      expect(result).toEqual([cocktailFixture]);
    });

    it('should return an empty array when no cocktails match the search', async () => {
      mockCocktailService.findAll.mockResolvedValue([]);

      const result = await controller.searchCocktail('unknown');

      expect(result).toEqual([]);
    });
  });

  describe('getCocktail', () => {
    it('should return a cocktail when it exists', async () => {
      mockCocktailService.findOne.mockResolvedValue(cocktailFixture);

      const result = await controller.getCocktail(1);

      expect(mockCocktailService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(cocktailFixture);
    });

    it('should throw NotFoundException when the cocktail does not exist', async () => {
      mockCocktailService.findOne.mockResolvedValue(null);

      await expect(controller.getCocktail(999)).rejects.toThrow(NotFoundException);
      await expect(controller.getCocktail(999)).rejects.toThrow('Cocktail with id 999 not found');
    });
  });

  describe('newCocktail', () => {
    it('should call service.create and return true on success', async () => {
      const payload = { title: 'Daiquiri', description: 'Rum and lime', price: 9.0 } as Cocktail;
      mockCocktailService.create.mockResolvedValue({ identifiers: [{ id: 2 }] });

      const result = await controller.newCocktail(payload);

      expect(mockCocktailService.create).toHaveBeenCalledWith(payload);
      expect(result).toBe(true);
    });

    it('should propagate exceptions thrown by the service', async () => {
      const payload = { title: 'Mojito', description: 'Already exists', price: 8.5 } as Cocktail;
      mockCocktailService.create.mockRejectedValue(
        new Error('A cocktail with title "Mojito" already exists'),
      );

      await expect(controller.newCocktail(payload)).rejects.toThrow();
    });
  });

  describe('updateCocktail', () => {
    it('should return the updated cocktail when it exists', async () => {
      const updated = { ...cocktailFixture, price: 10.0 };
      mockCocktailService.findOne.mockResolvedValue(cocktailFixture);
      mockCocktailService.update.mockResolvedValue(updated);

      const result = await controller.updateCocktail(1, { price: 10.0 });

      expect(mockCocktailService.findOne).toHaveBeenCalledWith(1);
      expect(mockCocktailService.update).toHaveBeenCalledWith(1, { price: 10.0 });
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException when the cocktail does not exist', async () => {
      mockCocktailService.findOne.mockResolvedValue(null);

      await expect(controller.updateCocktail(999, { price: 10.0 })).rejects.toThrow(NotFoundException);
      expect(mockCocktailService.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteCocktail', () => {
    it('should delete the cocktail when it exists', async () => {
      mockCocktailService.findOne.mockResolvedValue(cocktailFixture);
      mockCocktailService.delete.mockResolvedValue(undefined);

      await controller.deleteCocktail(1);

      expect(mockCocktailService.findOne).toHaveBeenCalledWith(1);
      expect(mockCocktailService.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when the cocktail does not exist', async () => {
      mockCocktailService.findOne.mockResolvedValue(null);

      await expect(controller.deleteCocktail(999)).rejects.toThrow(NotFoundException);
      expect(mockCocktailService.delete).not.toHaveBeenCalled();
    });
  });
});
