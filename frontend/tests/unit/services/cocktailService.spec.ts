import MockAdapter from 'axios-mock-adapter';
import {
  getCocktails,
  getCocktail,
  createCocktail,
  updateCocktail,
  deleteCocktail,
} from '@/services/cocktailService';
import apiClient from '@/services/apiClient';

const mock = new MockAdapter(apiClient);

const cocktailFixture = { id: 1, title: 'Mojito', description: 'Mint cocktail', price: 8.5 };

describe('cocktailService', () => {
  afterEach(() => {
    mock.reset();
  });

  describe('getCocktails', () => {
    it('should fetch all cocktails without a search param', async () => {
      mock.onGet('/cocktail').reply(200, [cocktailFixture]);

      const res = await getCocktails();

      expect(res.data).toEqual([cocktailFixture]);
    });

    it('should append the search query param when provided', async () => {
      mock.onGet('/cocktail', { params: { search: 'mojito' } }).reply(200, [cocktailFixture]);

      const res = await getCocktails('mojito');

      expect(res.data).toEqual([cocktailFixture]);
    });

    it('should not send a params object when search is undefined', async () => {
      mock.onGet('/cocktail').reply(200, []);

      const res = await getCocktails(undefined);

      expect(res.data).toEqual([]);
    });
  });

  describe('getCocktail', () => {
    it('should fetch a single cocktail by id', async () => {
      mock.onGet('/cocktail/1').reply(200, cocktailFixture);

      const res = await getCocktail(1);

      expect(res.data).toEqual(cocktailFixture);
    });

    it('should reject with the API detail message on a 404', async () => {
      mock.onGet('/cocktail/999').reply(404, { detail: 'Cocktail with id 999 not found' });

      await expect(getCocktail(999)).rejects.toThrow('Cocktail with id 999 not found');
    });
  });

  describe('createCocktail', () => {
    it('should POST the cocktail data and return the response', async () => {
      const payload = { title: 'Daiquiri', description: 'Rum and lime', price: 9.0 };
      mock.onPost('/cocktail', payload).reply(201, cocktailFixture);

      const res = await createCocktail(payload);

      expect(res.data).toEqual(cocktailFixture);
    });

    it('should reject with the conflict detail message on a 409', async () => {
      const payload = { title: 'Mojito', description: 'Already exists', price: 8.5 };
      mock.onPost('/cocktail').reply(409, { detail: 'A cocktail with title "Mojito" already exists' });

      await expect(createCocktail(payload)).rejects.toThrow('A cocktail with title "Mojito" already exists');
    });
  });

  describe('updateCocktail', () => {
    it('should PUT the updated data and return the response', async () => {
      const updated = { ...cocktailFixture, price: 10.0 };
      mock.onPut('/cocktail/1', { price: 10.0 }).reply(200, updated);

      const res = await updateCocktail(1, { price: 10.0 });

      expect(res.data).toEqual(updated);
    });

    it('should reject on a 404', async () => {
      mock.onPut('/cocktail/999').reply(404);

      await expect(updateCocktail(999, { price: 10.0 })).rejects.toThrow();
    });
  });

  describe('deleteCocktail', () => {
    it('should send a DELETE request for the given id', async () => {
      mock.onDelete('/cocktail/1').reply(204);

      await expect(deleteCocktail(1)).resolves.not.toThrow();
    });

    it('should reject on a 404', async () => {
      mock.onDelete('/cocktail/999').reply(404);

      await expect(deleteCocktail(999)).rejects.toThrow();
    });
  });
});
