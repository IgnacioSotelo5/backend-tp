import { Test, TestingModule } from '@nestjs/testing';
import { EscenariosController } from './escenarios.controller';
import { EscenariosService } from './escenarios.service';

describe('EscenariosController', () => {
  let controller: EscenariosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EscenariosController],
      providers: [EscenariosService],
    }).compile();

    controller = module.get<EscenariosController>(EscenariosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
