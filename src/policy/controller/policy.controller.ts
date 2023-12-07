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
import { QueryParser, Utils } from '../../_shared';
import { CreatePolicyDto } from '../../_shared/dto/policy';

@Controller('policies')
export class PolicyController {
  constructor(protected service: PolicyService) {}

  @Post('/push')
  @HttpCode(HttpStatus.OK)
  public async push(
    @Body() payload: CreatePolicyDto,
    @Res() res,
    @Req() req,
    @Next() next: NextFunction,
  ) {
    try {
      const queryParser = new QueryParser(Object.assign({}, req.query));
      const value = await this.service.push(payload);
      const response = await Utils.getResponse({
        queryParser,
        value,
        code: HttpStatus.CREATED,
        message: 'Policy published',
      });
      return res.status(HttpStatus.OK).json(response);
    } catch (e) {
      next(e);
    }
  }
}
