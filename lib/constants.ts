export type SortFilterItem = {
  title: string;
  slug: string | null;
  sortKey: 'createdAt' | 'minVariantPriceAmount';
  reverse: boolean;
};

export const defaultSort: SortFilterItem = {
  title: 'Latest arrivals',
  slug: 'latest-desc',
  sortKey: 'createdAt',
  reverse: true
};

export const sorting: SortFilterItem[] = [
  defaultSort,
  { title: 'Price: Low to high', slug: 'price-asc', sortKey: 'minVariantPriceAmount', reverse: false },
  { title: 'Price: High to low', slug: 'price-desc', sortKey: 'minVariantPriceAmount', reverse: true }
];

export const TAGS = {
  collections: 'collections',
  products: 'products',
  cart: 'cart'
};

export const HIDDEN_PRODUCT_TAG = 'nextjs-frontend-hidden';
export const DEFAULT_OPTION = 'Default Title';
export const SHOPIFY_GRAPHQL_API_ENDPOINT = '/api/2023-01/graphql.json';
