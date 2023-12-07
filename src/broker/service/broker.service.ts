import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AppException,
  AppResponse,
  Broker,
  BrokerDocument,
  Pagination,
  QueryParser,
  ResponseOption,
  Utils,
} from '../../_shared';

@Injectable()
export class BrokerService {
  public baseUrl = 'localhost:3000';
  public itemsPerPage = 10;
  constructor(@InjectModel(Broker.name) public model: Model<BrokerDocument>) {}

  async validateBeforeCreation(obj) {
    const broker = await this.model.findOne({ name: obj.name });
    console.log('broker ::: ', broker);
    if (broker) {
      throw AppException.FORBIDDEN('Broker with name already exist');
    }
  }

  /**
   * @param {Object} obj The payload object
   * @return {Object}
   */
  public async createNewObject(obj) {
    await this.validateBeforeCreation(obj);
    const data = new this.model({
      ...obj,
      publicKey: Utils.generateAppKey('pub_'),
      secretKey: Utils.generateAppKey('sec_'),
    });
    return data.save();
  }

  public async findObject(id) {
    try {
      const object = await this.model.findOne({ _id: id });
      if (!object) {
        throw AppException.NOT_FOUND('Data not found');
      }
      return object;
    } catch (error) {
      throw error;
    }
  }

  /**
   * @param {Object} object The payload object
   * @return {Object}
   */
  public async deleteObject(object) {
    await this.model.deleteOne({ _id: object._id });
    return object;
  }

  async buildModelQueryObject(
    pagination: Pagination,
    queryParser: QueryParser = null,
  ) {
    let query = this.model.find(queryParser.query);
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
      count: await this.model.countDocuments(queryParser.query).exec(),
    };
  }

  /**
   * @param {ResponseOption} option: required email for search
   * @return {Object} The formatted response
   */
  public async getResponse(option: ResponseOption) {
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
}
