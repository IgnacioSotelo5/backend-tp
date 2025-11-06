import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { DevicesModule } from './devices/devices.module'
import { ScenariosModule } from './scenarios/scenarios.module';

@Module({
  imports: [DevicesModule, ScenariosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
