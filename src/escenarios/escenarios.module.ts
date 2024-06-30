import { Module } from '@nestjs/common';
import { EscenariosService } from './escenarios.service';
import { EscenariosController } from './escenarios.controller';
import { DeviceFactory } from 'src/devices/device.factory';
import { DevicesService } from 'src/devices/devices.service';

@Module({
  controllers: [EscenariosController],
  providers: [EscenariosService, DeviceFactory, DevicesService],
})
export class EscenariosModule {}
