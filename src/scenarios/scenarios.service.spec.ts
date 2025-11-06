import { Test, TestingModule } from '@nestjs/testing';
import { ScenariosService } from './scenarios.service';
import { DevicesService } from '../devices/devices.service';
import { Scenario } from './entities/scenario.entity';
import { CreateScenarioDto } from './dto/create-scenario.dto';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { UpdateScenarioDto } from './dto/update-scenario.dto';
import { FileWriteException } from '../exceptions/file-write.exception';
import { ReadFileException } from '../exceptions/read-file.exception';
import * as fsPromises from 'fs/promises'
import * as fs from 'fs'
import { randomUUID } from 'crypto';
import { mockDevices } from '../devices/mocks/mockDevices';
import { LampColor } from '../devices/enums/lamp-color.enum';


describe('ScenariosService', () => {
  let service: ScenariosService;
  let devicesService: DevicesService;
  let readFileMock: jest.SpyInstance;
  let writeFileMock: jest.SpyInstance;

  const mockDevicesService = {
    findOne: jest.fn(),
    updateDevice: jest.fn()
  };

  const mockScenarios: Scenario[] = [
    {
      id: randomUUID(),
      name: 'Escenario 1',
      description: 'Descripción del escenario 1',
      devices: [
        mockDevices[0]
      ],
    },
    {
      id: randomUUID(),
      name: 'Escenario 2',
      description: 'Descripción del escenario 2',
      devices: [],
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScenariosService,
        { provide: DevicesService, useValue: mockDevicesService },
      ],
    }).compile();

    service = module.get<ScenariosService>(ScenariosService);
    devicesService = module.get<DevicesService>(DevicesService);

    // Mock readFile y writeFile para evitar operaciones reales de archivo
    readFileMock = jest.spyOn(fsPromises, 'readFile').mockResolvedValue(JSON.stringify(mockScenarios));
    writeFileMock = jest.spyOn(fsPromises, 'writeFile').mockResolvedValue();

    // Limpiar mocks y resetear estado antes de cada prueba
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('readFromFile', () => {
    it('should read scenarios from file', async () => {

      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
  
      jest.spyOn(fsPromises, 'readFile').mockResolvedValue(JSON.stringify(mockScenarios));
  
      const result = await service['readFromFile']();
      expect(result).toEqual(mockScenarios);
    });
    
    it('should handle scenario where file does not exist', async () => {
      // Mockeo de existsSync para simular que el archivo no existe
      jest.spyOn(fs, 'existsSync').mockReturnValue(false);
  
      // Mockeo de saveToFile para verificar si se llama con un arreglo vacío
      const saveToFileSpy = jest.spyOn(service, 'saveToFile');
  
      const result = await service.readFromFile();
      expect(result).toEqual([]);
      expect(saveToFileSpy).toHaveBeenCalledWith([]); // Verifica que se llamó a saveToFile con un arreglo vacío
    });
  
    it('should throw ReadFileException if file reading fails', async () => {
      // Mockeo de existsSync para simular que el archivo existe
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
  
      // Mockeo de readFile para simular un error al leer el archivo
      jest.spyOn(fsPromises, 'readFile').mockRejectedValueOnce(new Error('File read error'));
  
      await expect(service.readFromFile()).rejects.toThrow(ReadFileException);
    });
  
    it('should throw Error parsing data if JSON parsing fails', async () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
  
      // Mockeo de readFile para devolver datos que no se pueden parsear como JSON
      readFileMock.mockResolvedValueOnce('Invalid JSON Data')
      
      await expect(service.readFromFile()).rejects.toThrow(Error('Error parsing data'));
    });
  });
  

  describe('saveToFile', () => {
    it('should save scenarios to file', async () => {
      const scenariosToSave: Scenario[] = mockScenarios;
  
      // Mockeo de writeFile para verificar que se llama con los escenarios correctos
      jest.spyOn(fsPromises, 'writeFile').mockResolvedValue();
  
      await service.saveToFile(scenariosToSave);
      expect(fsPromises.writeFile).toHaveBeenCalledWith(
        service['path'],
        JSON.stringify(scenariosToSave, null, 2)
      );
    });
  
    it('should throw FileWriteException on write error', async () => {
      const scenariosToSave: Scenario[] = mockScenarios;
  
      // Mockeo de writeFile para simular un error al escribir el archivo
      jest.spyOn(fsPromises, 'writeFile').mockRejectedValueOnce(new Error('Write error'));
  
      await expect(service.saveToFile(scenariosToSave)).rejects.toThrow(FileWriteException);
    });
  });
  


  describe('create', () => {
    it('should create a new scenario', async () => {
      const createDto: CreateScenarioDto = {
        name: 'Nuevo Escenario',
        description: 'Descripción del nuevo escenario',
        devices: [{ id: randomUUID(), name: 'Lampara de la habitacion', type: 'lamp', status: false, settings: {brightness: 75} }, { id: randomUUID(), name: 'Lampara del living', type: 'lamp', status: false, settings: {brightness: 75} }],
      };

      // Mock findOne de DevicesService
      mockDevicesService.findOne.mockResolvedValueOnce(createDto.devices[0]).mockResolvedValueOnce(createDto.devices[1]);
      mockDevicesService.updateDevice.mockResolvedValueOnce(createDto.devices[0]).mockResolvedValueOnce(createDto.devices[1]);
    
      const result = await service.create(createDto);      

      expect(result).toMatchObject(createDto);
      expect(writeFileMock).toHaveBeenCalled();
    });

    it('should throw NotFoundException if device not found', async () => {
      const createDto: CreateScenarioDto = {
        name: 'Nuevo Escenario',
        description: 'Descripción del nuevo escenario',
        devices: [{ id: randomUUID(), name: 'Lampara de la habitacion', type: 'lamp', status: false, settings: {brightness: 75} }, { id: randomUUID(), name: 'Lampara del living', type: 'lamp', status: false, settings: {brightness: 75} }],
      };

      // Mock findOne de DevicesService para simular que uno de los dispositivos no existe
      mockDevicesService.findOne.mockResolvedValueOnce({id: '24'}).mockResolvedValueOnce(null);

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
      expect(writeFileMock).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException on saveToFile error', async () => {
      const createDto: CreateScenarioDto = {
        name: 'Nuevo Escenario',
        description: 'Descripción del nuevo escenario',
        devices: [],
      };
      
      writeFileMock.mockRejectedValueOnce(new Error('Write error'));

      await expect(service.create(createDto)).rejects.toThrow(FileWriteException);
    });

    it('Should throw InternalServerError on unknown error.', async () => {
      const createDto: CreateScenarioDto = {
        name: 'Escenario nuevo',
        description: 'Descripcion del escenario',
        devices: [{ id: randomUUID(), name: 'Device 1', type: 'lamp', status: false }],
      };
      
      jest.spyOn(service, 'create').mockRejectedValue(new InternalServerErrorException)
      await expect(service.create(createDto)).rejects.toThrow(InternalServerErrorException)
     
    });
    
  });

  describe('findAll', () => {
    it('should return all escenarios', async () => {
      const result = await service.findAll();
      
      expect(result).toEqual(mockScenarios);
    });

    it('should return message if no escenarios are found', async () => {
      readFileMock.mockResolvedValueOnce('[]'); // Simular que el archivo está vacío

      const result = await service.findAll();
      expect(result).toEqual({ message: 'There are no scenarios added yet.' });
    });

    it('should throw ReadFileException on read error', async () => {
      readFileMock.mockRejectedValueOnce(new Error('Read error'));

      await expect(service.findAll()).rejects.toThrow(ReadFileException);
    });
  });

  describe('findOne', () => {
    it('should return an escenario by id', async () => {
      const result = await service.findOne(mockScenarios[0].id);
      expect(result).toEqual(mockScenarios[0]);
    });

    it('should throw NotFoundException if escenario is not found', async () => {
      const nonExistentId = '999';
      readFileMock.mockResolvedValueOnce(JSON.stringify([])); // Simular que el archivo está vacío

      await expect(service.findOne(nonExistentId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an existing scenario with devices', async () => {
      const updateDto: UpdateScenarioDto = {
        name: 'Escenario Actualizado',
        description: 'Descripción actualizada del escenario',
        devices: [
          { id: mockDevices[0].id, name: 'Lámpara de la habitación actualizada', type: 'lamp', status: true, settings: { brightness: 50, color: LampColor.White } },
        ],
      };
  
      const result = await service.update(mockScenarios[1].id, updateDto);
  
      expect(result.name).toBe(updateDto.name);
      expect(result.description).toBe(updateDto.description);
      expect(result.devices).toHaveLength(1); // Verifica que solo hay un dispositivo actualizado
      expect(result.devices[0].name).toBe(updateDto.devices[0].name);
      expect(writeFileMock).toHaveBeenCalled(); // Verifica que se llamó a writeFile para guardar los cambios
    });

    it('should initialize existingDevices as empty array if devices are not defined in existingScenario', async () => {
      const updateDto: UpdateScenarioDto = {
        name: 'Escenario Actualizado',
        description: 'Descripción actualizada del escenario',
        devices: [], // Definir un DTO de actualización con dispositivos vacíos
      };
    
      // Mockeo de readFromFile para devolver un escenario sin dispositivos definidos
      const existingScenario: Scenario = {
        id: randomUUID(),
        name: 'Escenario 1',
        description: 'Descripción del escenario 1',
        devices: []
        // No definir devices para simular que no está definido en el escenario existente
      };
    
      jest.spyOn(service, 'readFromFile').mockResolvedValue([existingScenario]);
      jest.spyOn(service, 'saveToFile').mockResolvedValue();
    
      const result = await service.update(existingScenario.id, updateDto);
    
      expect(result.devices).toEqual([]); // Verifica que existingDevices se inicializa como un array vacío
    });

    it('should safely initialize settings if existingDevice.settings is not defined', async () => {
      const updateDto: UpdateScenarioDto = {
        name: 'Escenario Actualizado',
        description: 'Descripción actualizada del escenario',
        devices: [
          {
            id: randomUUID(),
            name: 'Dispositivo 1',
            type: 'lamp',
            status: true,
            settings: { brightness: 50 },
          },
        ],
      };
    
      const existingScenario: Scenario = {
        id: randomUUID(),
        name: 'Escenario 1',
        description: 'Descripción del escenario 1',
        devices: []
      };
    
      jest.spyOn(service, 'readFromFile').mockResolvedValue([existingScenario]);
      jest.spyOn(service, 'saveToFile').mockResolvedValue();
    
      const result = await service.update(existingScenario.id, updateDto);
      const updatedDevice = result.devices.find(dev => dev.id === updateDto.devices[0].id);
    
      expect(updatedDevice.settings).toEqual({ brightness: 50 }); // Verifica que settings se inicializa correctamente
    });  
  
    it('should not modify existing devices if not updated', async () => {
      const updateDto: UpdateScenarioDto = {
        name: 'Escenario Actualizado',
        description: 'Descripción actualizada del escenario',
      };
  
      const result = await service.update(mockScenarios[0].id, updateDto);
  
      expect(result.devices).toEqual(mockScenarios[0].devices); // Verifica que los dispositivos no se modificaron
      expect(writeFileMock).toHaveBeenCalled(); // Verifica que se llamó a writeFile para guardar los cambios
    });
  
    it('should add new device if it does not exist in current devices', async () => {
      const updateDto: UpdateScenarioDto = {
        name: 'Escenario Actualizado',
        description: 'Descripción actualizada del escenario',
        devices: [
          { id: randomUUID(), name: 'Nuevo Dispositivo', type: 'lamp', status: true, settings: { brightness: 50 } },
        ],
      };
  
      const result = await service.update(mockScenarios[0].id, updateDto);
  
      expect(result.devices).toHaveLength(2); // Verifica que se añadió un nuevo dispositivo
      expect(result.devices.map(device => device.name)).toContain('Nuevo Dispositivo');
      expect(writeFileMock).toHaveBeenCalled(); // Verifica que se llamó a writeFile para guardar los cambios
    });
  
    it('should throw NotFoundException if scenario to update is not found', async () => {
      const nonExistentId = '999';
    
      await expect(service.update(nonExistentId, {} as UpdateScenarioDto)).rejects.toThrow(NotFoundException);
      expect(writeFileMock).not.toHaveBeenCalled(); // No debe llamarse writeFile si el escenario no existe
    });
  
    it('should handle error when saving updated scenario', async () => {
      const updateDto: UpdateScenarioDto = {
        name: 'Escenario Actualizado',
        description: 'Descripción actualizada del escenario',
      };
    
      // Mockeo de saveToFile para simular un error al guardar el archivo
      jest.spyOn(service, 'saveToFile').mockRejectedValue(new FileWriteException('Save error'));
    
      await expect(service.update(mockScenarios[0].id, updateDto)).rejects.toThrow(FileWriteException);
      expect(service.saveToFile).toHaveBeenCalled(); // Verifica que se intentó guardar el archivo
    });
    
  });
  

  describe('remove', () => {
    it('should remove an escenario by id', async () => {
      const result = await service.remove(mockScenarios[0].id);
      expect(result).toEqual({ message: 'Scenario deleted successfully' });
      expect(writeFileMock).toHaveBeenCalled(); // Verifica que se llamó a writeFile para guardar los cambios
    });

    it('should throw NotFoundException if escenario to remove is not found', async () => {
      const nonExistentId = '999';

      await expect(service.remove(nonExistentId)).rejects.toThrow(NotFoundException);
      expect(writeFileMock).not.toHaveBeenCalled(); // No debe llamarse writeFile si el escenario no existe
    });
  });
});