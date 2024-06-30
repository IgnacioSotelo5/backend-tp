import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsString, ValidateNested } from "class-validator";
import { CreateDeviceDto } from "src/devices/dto/create-device.dto";
import { Device } from "src/devices/entities/device.entity";

export class CreateEscenarioDto {
    @IsString()
    @IsNotEmpty()
    name: string
    
    @IsString()
    @IsNotEmpty()
    description: string

    @IsArray()
    @ValidateNested({each: true})
    @Type(()=> CreateDeviceDto)
    devices: CreateDeviceDto[]
}
