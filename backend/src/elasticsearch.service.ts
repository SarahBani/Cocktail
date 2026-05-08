import { Injectable } from '@nestjs/common';
import { Client as EsClient } from '@elastic/elasticsearch';

const INDEX = 'cocktails';

@Injectable()
export class ElasticSearch {
  private client: EsClient;

  constructor() {
    this.client = new EsClient({ node: process.env.ELASTICSEARCH_HOST });
    this.checkConnection();
  }

  async checkConnection() {
    try {
      const isAlive = await this.client.ping();
      console.log('Elasticsearch cluster is up and running:', isAlive);
    } catch (error) {
      console.error('Elasticsearch cluster is down!', error);
    }
  }

  async indexCocktail(cocktail: { id: number; title: string; description: string }) {
    await this.client.index({
      index: INDEX,
      id: String(cocktail.id),
      document: {
        title: cocktail.title,
        description: cocktail.description,
      },
    });
  }

  async bulkIndex(cocktails: { id: number; title: string; description: string }[]) {
    if (cocktails.length === 0) return;
    const operations = cocktails.flatMap((c) => [
      { index: { _index: INDEX, _id: String(c.id) } },
      { title: c.title, description: c.description },
    ]);
    const response = await this.client.bulk({ operations, refresh: true });
    if (response.errors) {
      const failed = response.items.filter((i) => i.index?.error);
      console.error('Bulk index had errors:', JSON.stringify(failed));
    }
  }

  async fuzzySearch(query: string): Promise<number[]> {
    const result = await this.client.search({
      index: INDEX,
      query: {
        multi_match: {
          query,
          fields: ['title', 'description'],
          fuzziness: 'AUTO',
        },
      },
    });
    return result.hits.hits.map((hit) => Number(hit._id));
  }

  async deleteCocktail(id: number) {
    await this.client.delete({ index: INDEX, id: String(id) });
  }
}
