import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AppException,
  Policy,
  PolicyDocument,
  WebhookEvent,
  WebhookEventDocument,
  WorkService,
} from '../../_shared';
import { QueueTasks, WebHookEvents } from '../../../config';

@Injectable()
export class PolicyService {
  public baseUrl = 'localhost:3000';
  public itemsPerPage = 10;
  constructor(
    @InjectModel(Policy.name) public model: Model<PolicyDocument>,
    @InjectModel(WebhookEvent.name)
    public webHookModel: Model<WebhookEventDocument>,
    protected workService: WorkService,
  ) {}

  async validateBeforeCreation(obj) {
    const broker = await this.model.findOne({ name: obj.name });
    if (broker) {
      throw AppException.FORBIDDEN('Policy with name already exist');
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
    });
    return data.save();
  }

  public async updateObject(id, obj) {
    try {
      const policyUpdated: PolicyDocument = await this.model.findOneAndUpdate(
        { _id: id },
        {
          ...obj,
        },
        { new: true },
      );
      const webHookEvent = await this.webHookModel.create({
        event: WebHookEvents.PolicyUpdate,
        event_date: policyUpdated.updatedAt,
        data: {
          type: 'adjustment',
          covers: policyUpdated.covers,
        },
      });
      this.workService.addJob(QueueTasks.POLICY_UPDATE, {
        _id: webHookEvent.id,
      });
      return policyUpdated;
    } catch (error) {
      return false;
    }
  }
}
