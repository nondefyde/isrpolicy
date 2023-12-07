import { Pagination } from './pagination/pagination';
import { QueryParser } from './query-parser/query-parser';

export interface ResponseOption {
  value?: any | Document;
  code: number;
  queryParser?: QueryParser;
  pagination?: Pagination;
  message?: string;
  count?: number;
}
