import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Next,
  Param,
  Post,
  Put,
  Req,
  Res,
} from '@nestjs/common';
import { PolicyService } from '../service/policy.service';
import { NextFunction } from 'express';
import {
  AppException,
  CreatePolicyDto,
  Pagination,
  QueryParser,
  Utils,
} from '../../_shared';

@Controller('policies')
export class PolicyController {
  constructor(protected service: PolicyService) {}

  @Post('/')
  @HttpCode(HttpStatus.OK)
  public async create(
    @Body() payload: CreatePolicyDto,
    @Res() res,
    @Req() req,
    @Next() next: NextFunction,
  ) {
    try {
      const queryParser = new QueryParser(Object.assign({}, req.query));
      const value = await this.service.createNewObject(payload);
      const response = await Utils.getResponse({
        queryParser,
        value,
        code: HttpStatus.CREATED,
        message: 'Broker created',
      });
      return res.status(HttpStatus.OK).json(response);
    } catch (e) {
      next(e);
    }
  }

  @Get('/')
  @HttpCode(HttpStatus.OK)
  public async find(@Req() req, @Res() res, @Next() next: NextFunction) {
    const queryParser = new QueryParser(Object.assign({}, req.query));
    const pagination = new Pagination(
      req.originalUrl,
      this.service.baseUrl,
      this.service.itemsPerPage,
    );
    try {
      const { value, count } = await Utils.buildModelQueryObject(
        this.service.model,
        pagination,
        queryParser,
      );
      const response = await Utils.getResponse({
        code: HttpStatus.OK,
        value,
        count,
        queryParser,
        pagination,
      });
      return res.status(HttpStatus.OK).json(response);
    } catch (err) {
      next(err);
    }
  }

  @Put('/:id')
  @HttpCode(HttpStatus.OK)
  public async update(
    @Param('id') id: string,
    @Body() payload: any,
    @Req() req,
    @Res() res,
    @Next() next: NextFunction,
  ) {
    try {
      const queryParser = new QueryParser(Object.assign({}, req.query));
      let object = await Utils.findObject(this.service.model, id);
      if (!object) {
        throw AppException.NOT_FOUND('Data not found');
      }
      object = await this.service.updateObject(id, payload);
      const response = await Utils.getResponse({
        queryParser,
        code: HttpStatus.OK,
        value: object,
        message: 'Policy updated',
      });
      return res.status(HttpStatus.OK).json(response);
    } catch (err) {
      next(err);
    }
  }
}
