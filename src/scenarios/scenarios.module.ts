import { Module } from '@nestjs/common';
import { ScenariosService } from './scenarios.service';
import { ScenariosController } from './scenarios.controller';
import { DeviceFactory } from 'src/devices/device.factory';
import { DevicesService } from 'src/devices/devices.service';

@Module({
  controllers: [ScenariosController],
  providers: [ScenariosService, DeviceFactory, DevicesService],
})
export class ScenariosModule {}
