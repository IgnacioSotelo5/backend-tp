import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { CreateScenarioDto } from './dto/create-scenario.dto'
import { UpdateScenarioDto } from './dto/update-scenario.dto'
import { join } from 'path'
import { cwd } from 'process'
import { existsSync } from 'fs'
import { readFile, writeFile } from 'fs/promises'
import { ReadFileException } from '../exceptions/read-file.exception'
import { Scenario } from './entities/scenario.entity'
import { FileWriteException } from '../exceptions/file-write.exception'
import { DevicesService } from '../devices/devices.service'
import { Device } from '../devices/entities/device.entity'

@Injectable()
export class ScenariosService {
  private readonly path = join(cwd(), 'data', 'scenarios', 'scenarios.json')

  constructor(private readonly devicesService: DevicesService) {}

   async readFromFile(): Promise<Scenario[]> {
    try {
      if(!existsSync(this.path)){        
        await this.saveToFile([])
        return [];
      }
      const data = await readFile(this.path, {encoding: 'utf-8'})
      try {
        const scenarios = JSON.parse(data) as Scenario[]
        return scenarios
      } catch (error) {
        throw new Error('Error parsing data')
      }
    } catch (error) {
      if(error.message === 'Error parsing data'){
        throw error
      }
      console.error('Error reading scenarios data');
      throw new ReadFileException('Error loading scenarios data.');
    }
  }

   async saveToFile(scenarios: Scenario[]): Promise<void> {
   try {
    await writeFile(this.path, JSON.stringify(scenarios, null, 2))
   } catch (error) {
      console.error('Error saving scenarios file');
      throw new FileWriteException('Error saving scenarios data')  
   }
  }

  async create(createScenarioDto: CreateScenarioDto): Promise<Scenario> {
    const scenarios = await this.readFromFile();
    try {
      const devices: Device[] = [];
        for (const deviceDto of createScenarioDto.devices) {
          //findOne lanzara una excepcion si no encuentra el dispositivo con el id solicitado          
        const foundDevice = await this.devicesService.findOne(deviceDto.id);
        
        if(!foundDevice){
          throw new NotFoundException(`Device with id ${deviceDto.id} not found.`)
        }
        const updatedDevice = await this.devicesService.updateDevice(deviceDto.id, deviceDto)
        
        devices.push(updatedDevice)
      }
      const { name, description } = createScenarioDto;
      const scenario = new Scenario(name, description, devices);
      scenarios.push(scenario);
      await this.saveToFile(scenarios);
  
      return scenario;
    } catch (error) {      
      if(error instanceof NotFoundException){
        throw new NotFoundException(`${error.message}`);
      } else if(error instanceof FileWriteException){
        throw new FileWriteException(`Failed to save scenario to data file.`)
      }
    }
  }

  async findAll(): Promise<Scenario[] | {message: string}> {
    const scenarios = await this.readFromFile()
    return scenarios.length > 0 ? scenarios : { message: 'There are no scenarios added yet.' }
  }

  async findOne(id: string) {
    try {
      const scenario = await this.readFromFile().then((esc: Scenario[]) => esc.find((e) => e.id === id))
      if (!scenario) {
        throw new NotFoundException(`Scenario with ID ${id} not found.`);
      }
      return scenario
    } catch (error) {
      throw new NotFoundException(`Scenario with ID ${id} not found.`);
    }
  }

  async update(id: string, updateScenarioDto: UpdateScenarioDto): Promise<Scenario> {
    const scenarios = await this.readFromFile();
    const scenarioIndex = scenarios.findIndex((e) => e.id === id);

    if (scenarioIndex === -1) {
        throw new NotFoundException(`Scenario with ID ${id} not found.`);
    }

    const existingScenario = scenarios[scenarioIndex];
    const existingDevices = existingScenario.devices || []; // Inicializar como array vacío si no está definido

    let updatedDevicesDto: Device[] = []

    if (updateScenarioDto.devices !== undefined && updateScenarioDto.devices.length > 0) {
            updatedDevicesDto = updateScenarioDto.devices.map((updateDevice) => {
                const existingDevice = existingDevices.find((dev) => dev.id === updateDevice.id);

                if (existingDevice) {
                  
                    // Si el dispositivo existe, actualizar sus propiedades y settings
                    const updatedSettings = {
                        ...existingDevice.settings || {}, // Asegurar que existingDevice.settings esté definido
                        ...updateDevice.settings,
                    };
                    const updatedExistingDevice: Device = {
                      ...existingDevice,
                      ...updateDevice,
                      settings: updatedSettings,
                  };
                    return updatedExistingDevice
                } else {
                    // Si el dispositivo no existe, crear un nuevo objeto Device con settings inicializados
                    const newDevice: Device = {
                        id: updateDevice.id, // Asegúrate de que id esté presente y sea único
                        name: updateDevice.name,
                        type: updateDevice.type,
                        status: updateDevice.status,
                        settings: updateDevice.settings || {}, // Inicialización segura de settings
                    };
                    return newDevice;
                }
            });
    }

    const updatedDevices = [...existingDevices, ...updatedDevicesDto]

    const updatedScenario = {
        ...existingScenario,
        ...updateScenarioDto,
        devices: updatedDevices,
    };

    scenarios[scenarioIndex] = updatedScenario;
    await this.saveToFile(scenarios);

    return updatedScenario;
}



  async remove(id: string): Promise<{message: string}> {
    const scenarios = await this.readFromFile()
    const scenarioIndex = scenarios.findIndex((e) => e.id === id)
    if(scenarioIndex === -1){
      throw new NotFoundException(`Scenario with ID ${id} not found`)
    }
    scenarios.filter((scenario) => scenario.id !== id)
    await this.saveToFile(scenarios)
    return {message: 'Scenario deleted successfully'}
  }
}
