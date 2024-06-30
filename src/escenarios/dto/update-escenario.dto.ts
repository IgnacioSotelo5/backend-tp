import { PartialType } from '@nestjs/swagger';
import { CreateEscenarioDto } from './create-escenario.dto';

export class UpdateEscenarioDto extends PartialType(CreateEscenarioDto) {}
