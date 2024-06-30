import { Module } from '@nestjs/common'
import { DevicesService } from './devices.service'
import { DevicesController } from './devices.controller'
import { DeviceFactory } from './device.factory'

@Module({
  controllers: [DevicesController],
  providers: [DevicesService, DeviceFactory],
})
export class DevicesModule {}
