import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  Query,
} from '@nestjs/common'
import { DevicesService } from './devices.service'
import { CreateDeviceDto } from './dto/create-device.dto'
import { UpdateDeviceDto } from './dto/update-device.dto'
import { findOneParams } from './dto/params.dto'
import { Device } from './entities/device.entity'
import { ApiTags, ApiQuery } from '@nestjs/swagger'

@ApiTags('Devices')
@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post()
  async create(@Body() createDeviceDto: CreateDeviceDto): Promise<Device> {
    return await this.devicesService.createDevice(createDeviceDto)
  }

  @ApiQuery({
    name: 'name',
    required: false,
    description: 'Filter by device name',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Filter by device type',
  })
  @Get()
  async findAll(
    @Query('name') name?: string,
    @Query('type') type?: string,
  ): Promise<Device[] | { message: string }> {
    return await this.devicesService.findAll({ name, type })
  }

  @Get(':id')
  async findOne(@Param() id: findOneParams): Promise<Device> {
    return await this.devicesService.findOne(id.id)
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDeviceDto: UpdateDeviceDto,
  ): Promise<Device> {
    return await this.devicesService.updateDevice(id, updateDeviceDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    return await this.devicesService.removeDevice(id)
  }
}
