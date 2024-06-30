import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EscenariosService } from './escenarios.service';
import { CreateEscenarioDto } from './dto/create-escenario.dto';
import { UpdateEscenarioDto } from './dto/update-escenario.dto';
import { Escenario } from './entities/escenario.entity';

@Controller('escenarios')
export class EscenariosController {
  constructor(private readonly escenariosService: EscenariosService) {}

  @Post()
  async create(@Body() createEscenarioDto: CreateEscenarioDto): Promise<Escenario> {
    return await this.escenariosService.create(createEscenarioDto);
  }

  @Get()
  async findAll(): Promise<Escenario[] | { message: string }> {
    return await this.escenariosService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Escenario> {
    return await this.escenariosService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateEscenarioDto: UpdateEscenarioDto,
  ): Promise<Escenario> {
    return await this.escenariosService.update(id, updateEscenarioDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    return await this.escenariosService.remove(id);
  }
}
