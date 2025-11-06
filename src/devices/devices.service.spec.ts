import { Test, TestingModule } from '@nestjs/testing';
import { DevicesService } from './devices.service';
import { DeviceFactory } from './device.factory';
import { CreateDeviceDto } from './dto/create-device.dto';
import { randomUUID } from 'crypto';
import { Device } from './entities/device.entity';
import { mockDevices } from './mocks/mockDevices';
import { HttpStatus, NotFoundException } from '@nestjs/common';
import { UpdateDeviceDto } from './dto/update-device.dto';
import * as fsPromises from 'fs/promises';
import * as fs from 'fs'
import { ReadFileException } from '../exceptions/read-file.exception';
import { FileWriteException } from '../exceptions/file-write.exception';
import { join } from 'path';

describe('DevicesService', () => {
  let service: DevicesService;
  let deviceFactory: DeviceFactory;
  let writeFileMock: jest.SpyInstance;
  let readFileMock: jest.SpyInstance

  const mockDeviceFactory = {
    createDevice: jest.fn(),
  };
  
  let originalMockDevices: Device[]

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DevicesService,
        { provide: DeviceFactory, useValue: mockDeviceFactory },
      ],
    }).compile();

    service = module.get<DevicesService>(DevicesService);
    deviceFactory = module.get<DeviceFactory>(DeviceFactory);

    originalMockDevices = [...mockDevices]

    readFileMock = jest.spyOn(fsPromises, 'readFile').mockResolvedValue(JSON.stringify(mockDevices));
    writeFileMock = jest.spyOn(fsPromises, 'writeFile').mockResolvedValue()

    jest.clearAllMocks()
  });

  afterEach(() => {
    jest.restoreAllMocks();
    mockDevices.length = 0
    mockDevices.push(...originalMockDevices)
  });

  describe('loadDevicesFromFile', () => {
    it('should load devices from file', async () => {
      const devices = await service.loadDevicesFromFile();
      expect(devices).toEqual(mockDevices);
    });
    
    it('should handle scenario where file does not exist', async () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(false)
      
      // Mockeo de saveToFile para verificar si se llama con un arreglo vacío
      const saveToFileSpy = jest.spyOn(service, 'saveToFile');
  
      const result = await service.loadDevicesFromFile();
      expect(result).toEqual([]);
      expect(saveToFileSpy).toHaveBeenCalledWith([]); // Verifica que se llamó a saveToFile con un arreglo vacío
    });

    it('should throw ReadFileException when file does not exist', async () => {
      readFileMock.mockRejectedValue(new Error('File not found'))     
      await expect(service.loadDevicesFromFile()).rejects.toThrow(new ReadFileException('Error loading devices data.'));
    });

    it('should throw ReadFileException on read error', async () => {
      readFileMock.mockRejectedValue(new Error('Read error'));
      
      await expect(service.loadDevicesFromFile()).rejects.toThrow(new ReadFileException('Error loading devices data.'));
    });
  });

  describe('saveToFile', () => {
    it('should save devices to file', async () => {
      const devicesToSave = [...mockDevices];
      await service.saveToFile(devicesToSave);
      
      expect(writeFileMock).toHaveBeenCalledWith(
        expect.stringContaining(join(process.cwd(), 'data', 'devices', 'devices.json')),
        expect.stringContaining(JSON.stringify(devicesToSave, null, 2))
      );
    });

    it('should throw FileWriteException on write error', async () => {
      writeFileMock.mockRejectedValue(new Error('Write error'));
      
      const devicesToSave = [...mockDevices];
      await expect(service.saveToFile(devicesToSave)).rejects.toThrow(new FileWriteException('Error saving devices data'));
    });
    
    it('should throw FileWriteException on write error', async () => {
      writeFileMock.mockRejectedValue(new Error('Write error'));
      
      const devicesToSave = [...mockDevices];
      await expect(service.saveToFile(devicesToSave)).rejects.toThrow(new FileWriteException('Error saving devices data'));
    });
  });


  describe('createDevice', () => {
    it('should create a new device', async () => {
      const dto: CreateDeviceDto = {
        id: null,
        name: 'Lamp 25',
        type: 'lamp',
        status: true,
        settings: {}
      };

      const mockDevice: Device = {
        id: randomUUID(),
        ...dto,
      };
      
      mockDeviceFactory.createDevice.mockReturnValue(mockDevice);
      
      const result = await service.createDevice(dto);      
            

      expect(mockDeviceFactory.createDevice).toHaveBeenCalledWith('lamp', dto);
      expect(result).toEqual(mockDevice);      
    });

    it('should throw an error if device creation fails', async () => {
      const dtoError: CreateDeviceDto = {
        id: null,
        name: 'Lamp 1',
        type: 'lampara',
        status: true,
        settings: {},
      };

      jest.spyOn(deviceFactory, 'createDevice').mockImplementation(() => {
        throw new Error('Unsupported device type: lampara');
      });

      await expect(service.createDevice(dtoError)).rejects.toThrow('Unsupported device type: lampara');
    });
  });

  describe('findAll', () => {
    it('should return all devices', async () => {

      const result = await service.findAll({});      

      expect(result).toEqual(mockDevices);
    });

    it('should filter devices by name', async () => {
      const result = await service.findAll({ name: 'THERMOSTAT 1' });

      expect(result).toEqual([mockDevices[1]]);
    });

    it('should filter devices by type', async () => {
      const result = await service.findAll({type: 'lamp'})
      
      expect(result).toEqual([mockDevices[0]])
    });

    it('should return a message if no devices are found', async () => {
      jest.spyOn(service, 'loadDevicesFromFile').mockResolvedValue([])
      const result = await service.findAll({});

      expect(result).toEqual({ message: 'There are no devices added yet.' });
    });
  });

  describe('findOne', () => {
    it('should return a device by id', async () => {
      const result = await service.findOne(mockDevices[0].id);

      expect(result).toEqual(mockDevices[0]);
    });

    it('should throw NotFoundException if device is not found', async () => {
      jest.spyOn(service, 'loadDevicesFromFile').mockResolvedValue([])
      await expect(service.findOne(mockDevices[0].id)).rejects.toThrow(new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Device with ID ${mockDevices[0].id} not found.`,
      }));
    });
  });

  describe('updateDevice', () => {
    it('should update an existing device', async () => {
      const updateDto: UpdateDeviceDto = {
        name: 'Lamp 1 updated',
        status: false,
        settings: {
          brightness: 50,
        },
      };

      const updatedDevice = await service.updateDevice(mockDevices[0].id, updateDto);

      expect(updatedDevice).toMatchObject({
        ...mockDevices[0],
        name: 'Lamp 1 updated',
        status: false,
        settings: {
          brightness: 50,
        },
      });
    });

    it('should throw NotFoundException if device to update is not found', async () => {

      const updateDto: UpdateDeviceDto = {
        name: 'lamp',
        type: 'lamp',
        status: true,
      };

      await expect(service.updateDevice('1', updateDto)).rejects.toThrow(new NotFoundException(`Device with ID 1 not found`));
    });
  });

  describe('removeDevice', () => {
    it('should remove a device by id', async () => {
      const idToDelete = mockDevices[1].id
      const result = await service.removeDevice(idToDelete);     
      

      expect(result).toEqual({ message: `Device with ID ${idToDelete} was deleted successfully.` });
    });

    it('should throw NotFoundException if device to remove is not found', async () => {
      jest.spyOn(service, 'loadDevicesFromFile').mockResolvedValue([]);

      await expect(service.removeDevice('1')).rejects.toThrow(new NotFoundException(`Device with ID 1 not found.`));
    });
  });
});
