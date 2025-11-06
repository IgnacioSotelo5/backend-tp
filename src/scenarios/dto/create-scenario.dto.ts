import { Type } from 'class-transformer'
import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator'
import { UpdateDeviceDto } from '../../devices/dto/update-device.dto'
import { ApiProperty } from '@nestjs/swagger'

export class CreateScenarioDto {
  @ApiProperty({
    description: 'Name of the scenario',
  })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({
    description: 'Description of the scenario',
  })
  @IsString()
  @IsNotEmpty()
  description: string

  @ApiProperty({
    description: 'List of devices in the scenario',
    type: [UpdateDeviceDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateDeviceDto)
  devices: UpdateDeviceDto[]
}
