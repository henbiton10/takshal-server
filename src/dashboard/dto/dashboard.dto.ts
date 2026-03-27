export class TerminalAllocationInfoDto {
  direction: 'transmission' | 'reception';
  frequency: number;
  satellite: string;
  antenna: string;
  antennaSize: number;
  frequencyBand: 'ka' | 'ku';
  channel: string;
  connectivity?: string;
}

export class DashboardTerminalDto {
  id: number;
  name: string;
  stationId: number;
  stationName: string;
  frequencyBand: 'ka' | 'ku';
  readinessStatus: 'ready' | 'partly_ready' | 'damaged';
  isAllocated: boolean;
  allocations: TerminalAllocationInfoDto[];
}

export class AntennaChannelStatusDto {
  channelType: string;
  used: number;
  total: number;
}

export class DashboardAntennaDto {
  id: number;
  size: number;
  frequencyBand: 'ka' | 'ku';
  stationId: number;
  channels: AntennaChannelStatusDto[];
}

export class DashboardStationDto {
  id: number;
  name: string;
  organizationalAffiliation: 'airforce' | 'navy' | 'ground' | 'intelligence' | 'other';
  readinessStatus: 'ready' | 'partly_ready' | 'damaged';
  terminals: DashboardTerminalDto[];
  antennas: DashboardAntennaDto[];
}

export class SatelliteAllocationDto {
  stationId: number;
  stationName: string;
  terminalId: number;
  terminalName: string;
  frequencyBand: 'ka' | 'ku';
  antennaSize: number;
  direction: 'transmission' | 'reception';
}

export class DashboardSatelliteDto {
  id: number;
  name: string;
  affiliation: 'local' | 'global';
  hasFrequencyConverter: boolean;
  readinessStatus: 'ready' | 'partly_ready' | 'damaged';
  allocations: SatelliteAllocationDto[];
}

export class DashboardNetworkDto {
  id: number;
  name: string;
  terminalTypeId: number;
  connectivityTypeId: number;
  terminals: { id: number; name: string }[];
}

export class DashboardDataDto {
  stations: DashboardStationDto[];
  satellites: DashboardSatelliteDto[];
  networks: DashboardNetworkDto[];
  lastUpdated: string;
}

export class ExternalTerminalAllocationDto {
  name: string;
  direction: string;
  groundStation: string;
  bandwidth_MHz: number;
  f_center_UL_MHz: number;
  f_center_DL_MHz: number;
  eirp: number;
  customer: string;
  id: string;
  channel: string;
  satellite: string;
}
