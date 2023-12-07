import { randomBytes } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { AppException, AppResponse, Pagination, QueryParser, ResponseOption } from "./common";

export class Utils {
  static isValidURL = (str) => {
    if (!str) return false;

    const pattern = new RegExp(
      '^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$',
      'i',
    ); // fragment locator
    return !!pattern.test(str);
  };

  public static generateAppKey = (
    prefix = '',
    format: BufferEncoding = 'hex',
  ) => {
    return prefix + randomBytes(8).toString(format) + uuidv4();
  };

  public static getResponse(option: ResponseOption) {
    try {
      const meta: any = AppResponse.getSuccessMeta();
      Object.assign(meta, { statusCode: option.code });
      if (option.message) {
        meta.message = option.message;
      }
      if (option.pagination && !option.queryParser.getAll) {
        option.pagination.totalCount = option.count;
        if (option.pagination.morePages(option.count)) {
          option.pagination.next = option.pagination.current + 1;
        }
        meta.pagination = option.pagination.done();
      }
      return AppResponse.format(meta, option.value);
    } catch (e) {
      throw e;
    }
  }

  public static async buildModelQueryObject(
    model,
    pagination: Pagination,
    queryParser: QueryParser = null,
  ) {
    let query = model.find(queryParser.query);
    if (!queryParser.getAll) {
      query = query.skip(pagination.skip).limit(pagination.perPage);
    }
    query = query.sort(
      queryParser && queryParser.sort
        ? Object.assign(queryParser.sort, { createdAt: -1 })
        : '-createdAt',
    );
    return {
      value: await query.select(queryParser.selection).exec(),
      count: await model.countDocuments(queryParser.query).exec(),
    };
  }

  public static async findObject(model, id) {
    try {
      const object = await model.findOne({ _id: id });
      if (!object) {
        throw AppException.NOT_FOUND('Data not found');
      }
      return object;
    } catch (error) {
      throw error;
    }
  }
}
