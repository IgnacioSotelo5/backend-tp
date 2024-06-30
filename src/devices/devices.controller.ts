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

@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post()
  create(@Body() createDeviceDto: CreateDeviceDto) {    
    return this.devicesService.createDevice(createDeviceDto)
  }

  @Get()
  findAll(@Query('name') name: string, @Query('type') type: string) {
    return this.devicesService.findAll(name, type)
  }

  @Get(':id')
  findOne(@Param() id: findOneParams) {
    return this.devicesService.findOne(id.id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDeviceDto: UpdateDeviceDto) {
    return this.devicesService.updateDevice(id, updateDeviceDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.devicesService.removeDevice(id)
  }
}
