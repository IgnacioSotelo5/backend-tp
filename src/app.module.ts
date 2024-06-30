import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { DevicesModule } from './devices/devices.module'
import { EscenariosModule } from './escenarios/escenarios.module';

@Module({
  imports: [DevicesModule, EscenariosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
