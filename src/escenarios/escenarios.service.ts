import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { CreateEscenarioDto } from './dto/create-escenario.dto'
import { UpdateEscenarioDto } from './dto/update-escenario.dto'
import { join } from 'path'
import { cwd } from 'process'
import { existsSync } from 'fs'
import { readFile, writeFile } from 'fs/promises'
import { ReadFileException } from 'src/exceptions/readFile.exception'
import { Escenario } from './entities/escenario.entity'
import { FileWriteException } from 'src/exceptions/fileWrite.exception'
import { DevicesService } from 'src/devices/devices.service'
import { Device } from 'src/devices/entities/device.entity'

@Injectable()
export class EscenariosService {
  private readonly path = join(cwd(), 'data', 'escenarios', 'escenarios.json')

  constructor(private readonly DevicesService: DevicesService) {}

  private async readFromFile(): Promise<Escenario[]> {
    try {
      if(!existsSync(this.path)){        
        this.saveToFile([])
        return [];
      }
      const data = await readFile(this.path, {encoding: 'utf-8'})
      try {
        const escenarios = JSON.parse(data) as Escenario[]
        return escenarios
      } catch (error) {
        throw new Error('Error parsing data')
      }
    } catch (error) {
      console.error('Error reading escenarios data', error);
      throw new ReadFileException('Error loading escenarios data.');
    }
  }

  private async saveToFile(escenarios: Escenario[]): Promise<void> {
   try {
    await writeFile(this.path, JSON.stringify(escenarios, null, 2))
   } catch (error) {
      console.error('Error saving devices file');
      throw new FileWriteException('Error saving devices data')  
   }
  }

  async create(createEscenarioDto: CreateEscenarioDto): Promise<Escenario> {
    const escenarios = await this.readFromFile();
    try {
      const devices: Device[] = [];
        for (const deviceDto of createEscenarioDto.devices) {
        const foundDevice = await this.DevicesService.findOne(deviceDto.id);
        if (!foundDevice) {
          throw new NotFoundException(`Device with ID ${deviceDto.id} not found.`);
        }
        devices.push(foundDevice);
      }
      const { name, description } = createEscenarioDto;
      const escenario = new Escenario(name, description, devices);
      escenarios.push(escenario);
      await this.saveToFile(escenarios);
  
      return escenario;
    } catch (error) {
      throw new InternalServerErrorException(`Failed to create escenario: ${error.message}`);
    }
  }

  async findAll(): Promise<Escenario[] | {message: string}> {
    const escenarios = await this.readFromFile()
    return escenarios.length > 0 ? escenarios : { message: 'There are no escenarios added yet.' }
  }

  async findOne(id: string) {
    try {
      const escenario = await this.readFromFile().then((esc: Escenario[]) => esc.find((e) => e.id === id))
      if (!escenario) {
        throw new NotFoundException(`Escenario with ID ${id} not found.`);
      }
      return escenario
    } catch (error) {
      throw new NotFoundException(`Escenario with ID ${id} not found.`);
    }
  }

  async update(id: string, updateEscenarioDto: UpdateEscenarioDto): Promise<Escenario> {
    const escenarios = await this.readFromFile()
    const escenarioIndex = escenarios.findIndex((e) => e.id === id)
    if(escenarioIndex === -1){
      throw new NotFoundException(`Escenario with ID ${id} not found.`)
    }

    const existingEscenario = escenarios[escenarioIndex]
    const existingDevices = existingEscenario.devices

    //mapeo los dispositivos existentes para verificar si sufren modificaciones  o no
    const updatedDevices = existingDevices.map((existingDevices) => {
      // por cada dispositivo existente evaluamos si el dto contiene este dispositivo
      const updatedDevice = updateEscenarioDto.devices.find((device) => device.id === existingDevices.id)
      if(updatedDevice){
        // si el dto contiene el dispositivo mantenemos las propiedades actuales
        // y agregamos las nuevas actualizaciones
        return{
          ...existingDevices,
          ...updatedDevice,
          settings:{
            ...existingDevices.settings,
            ...updatedDevice.settings
          }
        }
      } else {
        //si no, devolvemos el dispositivo tal cual
        return existingDevices
      }
    })

    // creo el objeto del escenario con sus propiedades antiguas y las nuevas actualizadas
    // y los dispositivos actualizados
    const updatedEscenario: Escenario = {
      ...existingEscenario,
      ...updateEscenarioDto,
      devices: updatedDevices
    }

    // actualizamos el objeto utilizando el indice
    escenarios[escenarioIndex] = updatedEscenario

    //guardo los cambios y retorno el nuevo escenario
    await this.saveToFile(escenarios)
    return updatedEscenario
  }

  async remove(id: string): Promise<{message: string}> {
    const escenarios = await this.readFromFile()
    const escenarioIndex = escenarios.findIndex((e) => e.id === id)
    if(escenarioIndex === -1){
      throw new NotFoundException(`Escenario with ID ${id} not found`)
    }
    escenarios.splice(escenarioIndex, 1)
    await this.saveToFile(escenarios)
    return {message: 'Escenario deleted successfully'}
  }
}
