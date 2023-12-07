import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Next,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { BrokerService } from '../service/broker.service';
import { NextFunction } from 'express';
import { CreateBrokerDto, Pagination, QueryParser, Utils } from '../../_shared';

@Controller('brokers')
export class BrokerController {
  constructor(protected service: BrokerService) {}

  @Post('/')
  @HttpCode(HttpStatus.OK)
  public async create(
    @Body() payload: CreateBrokerDto,
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
      const response = await this.service.getResponse({
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

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  public async findOne(
    @Param('id') id: string,
    @Req() req,
    @Res() res,
    @Next() next: NextFunction,
  ) {
    try {
      const queryParser = new QueryParser(Object.assign({}, req.query));
      const object = await this.service.findObject(id);
      const response = await Utils.getResponse({
        queryParser,
        code: HttpStatus.OK,
        value: object,
      });
      return res.status(HttpStatus.OK).json(response);
    } catch (err) {
      next(err);
    }
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.OK)
  public async remove(
    @Param('id') id: string,
    @Req() req,
    @Res() res,
    @Next() next: NextFunction,
  ) {
    try {
      let object = await this.service.findObject(id);
      object = await this.service.deleteObject(object);
      const response = await Utils.getResponse({
        code: HttpStatus.OK,
        value: { _id: object._id },
        message: 'Broker deleted',
      });
      return res.status(HttpStatus.OK).json(response);
    } catch (err) {
      next(err);
    }
  }
}
