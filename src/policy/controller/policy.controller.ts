import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Next,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { PolicyService } from '../service/policy.service';
import { NextFunction } from 'express';
import { Utils } from '../../_shared';

@Controller('policies')
export class PolicyController {
  constructor(protected service: PolicyService) {}

  @Post('/push')
  @HttpCode(HttpStatus.OK)
  public async push(
    @Body() payload: any,
    @Res() res,
    @Req() req,
    @Next() next: NextFunction,
  ) {
    try {
      const value = await this.service.push(payload);
      const response = await Utils.getResponse({
        value,
        code: HttpStatus.CREATED,
        message: 'Policy published',
      });
      return res.status(HttpStatus.OK).json(response);
    } catch (e) {
      next(e);
    }
  }

  @Post('/update')
  @HttpCode(HttpStatus.OK)
  public async pushUpdate(
    @Body() payload: any,
    @Res() res,
    @Req() req,
    @Next() next: NextFunction,
  ) {
    try {
      await this.service.pushMessage(payload);
      const response = await Utils.getResponse({
        value: { success: true },
        code: HttpStatus.CREATED,
        message: 'Policy published via rabbitMQ',
      });
      return res.status(HttpStatus.OK).json(response);
    } catch (e) {
      next(e);
    }
  }
}
