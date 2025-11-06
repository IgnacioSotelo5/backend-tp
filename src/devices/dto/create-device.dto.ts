import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'
import { LampSettings } from '../interfaces/lamp-settings.interface'
import { ThermostatSettings } from '../interfaces/thermostat-settings.interface'
import { CameraSettings } from '../interfaces/camera-settings.interface'
import { UUID } from 'crypto'
import { LampColor } from '../enums/lamp-color.enum'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

class SettingsDto {}

class LampSettingsDto extends SettingsDto implements LampSettings {
  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Brightness level of the lamp',
    example: 75,
  })
  brightness?: number

  @IsString()
  @IsOptional()
  @IsEnum(LampColor)
  @ApiPropertyOptional({
    description: 'Color of the lamp',
    example: LampColor.WarmWhite,
    enum: LampColor,
  })
  color?: LampColor
}

class ThermostatSettingsDto extends SettingsDto implements ThermostatSettings {
  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Target temperature for the thermostat',
    example: 22.5,
  })
  temperature?: number
}

class CameraSettingsDto extends SettingsDto implements CameraSettings {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Resolution of the camera',
    example: '1080p',
  })
  resolution?: string

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Frame rate of the camera',
    example: 30,
  })
  frameRate?: number

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Night vision capability of the camera',
    example: true,
  })
  nightVision?: boolean
}

export class CreateDeviceDto {
  @IsUUID()
  @IsOptional()
  @ApiProperty({
    description: 'Unique identifier for the device',
    format: 'uuid',
  })
  id: UUID

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Name of the device',
  })
  name: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Type of the device',
  })
  type: string

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Status of the device',
  })
  status: boolean

  @ValidateNested()
  @Type((options) => {
    const type = options.object['type']
    switch (type) {
      case 'lamp':
        return LampSettingsDto
      case 'thermostat':
        return ThermostatSettingsDto
      case 'camera':
        return CameraSettingsDto
      default:
        return SettingsDto
    }
  })
  settings: LampSettings | ThermostatSettings | CameraSettings
}
