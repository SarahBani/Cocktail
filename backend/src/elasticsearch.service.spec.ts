import { ElasticSearch } from './elasticsearch.service';

const mockPing = jest.fn();
const mockIndex = jest.fn();
const mockBulk = jest.fn();
const mockSearch = jest.fn();
const mockDelete = jest.fn();

jest.mock('@elastic/elasticsearch', () => ({
  Client: jest.fn().mockImplementation(() => ({
    ping: mockPing,
    index: mockIndex,
    bulk: mockBulk,
    search: mockSearch,
    delete: mockDelete,
  })),
}));

describe('ElasticSearch', () => {
  let service: ElasticSearch;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPing.mockResolvedValue(true);
    mockIndex.mockResolvedValue({});
    mockBulk.mockResolvedValue({ errors: false, items: [] });
    mockSearch.mockResolvedValue({ hits: { hits: [{ _id: '1' }, { _id: '2' }] } });
    mockDelete.mockResolvedValue({});

    process.env.ELASTICSEARCH_HOST = 'http://localhost:9200';
    service = new ElasticSearch();
  });

  describe('checkConnection', () => {
    it('should ping the Elasticsearch cluster', async () => {
      await service.checkConnection();
      expect(mockPing).toHaveBeenCalled();
    });

    it('should handle a failed ping gracefully without throwing', async () => {
      mockPing.mockRejectedValueOnce(new Error('Connection refused'));
      await expect(service.checkConnection()).resolves.not.toThrow();
    });
  });

  describe('indexCocktail', () => {
    it('should index a cocktail with the correct document shape', async () => {
      await service.indexCocktail({ id: 1, title: 'Mojito', description: 'A mint cocktail' });
      expect(mockIndex).toHaveBeenCalledWith({
        index: 'cocktails',
        id: '1',
        document: { title: 'Mojito', description: 'A mint cocktail' },
      });
    });

    it('should convert numeric id to string for the document _id', async () => {
      await service.indexCocktail({ id: 42, title: 'Test', description: 'Desc' });
      expect(mockIndex).toHaveBeenCalledWith(
        expect.objectContaining({ id: '42' }),
      );
    });
  });

  describe('bulkIndex', () => {
    it('should return early and not call bulk when array is empty', async () => {
      await service.bulkIndex([]);
      expect(mockBulk).not.toHaveBeenCalled();
    });

    it('should call bulk with correct operations format', async () => {
      await service.bulkIndex([
        { id: 1, title: 'Mojito', description: 'Mint cocktail' },
        { id: 2, title: 'Piña Colada', description: 'Tropical cocktail' },
      ]);
      expect(mockBulk).toHaveBeenCalledWith({
        operations: [
          { index: { _index: 'cocktails', _id: '1' } },
          { title: 'Mojito', description: 'Mint cocktail' },
          { index: { _index: 'cocktails', _id: '2' } },
          { title: 'Piña Colada', description: 'Tropical cocktail' },
        ],
        refresh: true,
      });
    });

    it('should log errors when bulk response contains errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockBulk.mockResolvedValueOnce({
        errors: true,
        items: [{ index: { error: { reason: 'document missing' } } }],
      });

      await service.bulkIndex([{ id: 1, title: 'Mojito', description: 'Mint' }]);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('fuzzySearch', () => {
    it('should return an array of numeric IDs from hits', async () => {
      const ids = await service.fuzzySearch('mojito');
      expect(ids).toEqual([1, 2]);
    });

    it('should call search with the correct multi_match query', async () => {
      await service.fuzzySearch('cola');
      expect(mockSearch).toHaveBeenCalledWith({
        index: 'cocktails',
        query: {
          multi_match: {
            query: 'cola',
            fields: ['title', 'description'],
            fuzziness: 'AUTO',
          },
        },
      });
    });

    it('should return an empty array when there are no hits', async () => {
      mockSearch.mockResolvedValueOnce({ hits: { hits: [] } });
      const ids = await service.fuzzySearch('xyz');
      expect(ids).toEqual([]);
    });
  });

  describe('deleteCocktail', () => {
    it('should call delete with the correct index and string id', async () => {
      await service.deleteCocktail(7);
      expect(mockDelete).toHaveBeenCalledWith({ index: 'cocktails', id: '7' });
    });

    it('should convert numeric id to string for the document _id', async () => {
      await service.deleteCocktail(42);
      expect(mockDelete).toHaveBeenCalledWith(expect.objectContaining({ id: '42' }));
    });
  });
});
