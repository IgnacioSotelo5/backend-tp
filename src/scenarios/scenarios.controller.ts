import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common'
import { ScenariosService } from './scenarios.service'
import { CreateScenarioDto } from './dto/create-scenario.dto'
import { UpdateScenarioDto } from './dto/update-scenario.dto'
import { Scenario } from './entities/scenario.entity'
import { ApiTags } from '@nestjs/swagger'

@ApiTags('Scenarios')
@Controller('scenarios')
export class ScenariosController {
  constructor(private readonly scenariosService: ScenariosService) {}

  @Post()
  async create(
    @Body() createScenarioDto: CreateScenarioDto,
  ): Promise<Scenario> {
    return await this.scenariosService.create(createScenarioDto)
  }

  @Get()
  async findAll(): Promise<Scenario[] | { message: string }> {
    return await this.scenariosService.findAll()
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Scenario> {
    return await this.scenariosService.findOne(id)
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateScenarioDto: UpdateScenarioDto,
  ): Promise<Scenario> {
    return await this.scenariosService.update(id, updateScenarioDto)
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    return await this.scenariosService.remove(id)
  }
}
