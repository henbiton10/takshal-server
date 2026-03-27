import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { SatellitesModule } from './satellites/satellites.module';
import { TerminalsModule } from './terminals/terminals.module';
import { StationsModule } from './stations/stations.module';
import { NetworksModule } from './networks/networks.module';
import { TerminalTypesModule } from './terminal-types/terminal-types.module';
import { ConnectivityTypesModule } from './connectivity-types/connectivity-types.module';
import { OperationOrdersModule } from './operation-orders/operation-orders.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    HealthModule,
    SatellitesModule,
    TerminalsModule,
    StationsModule,
    NetworksModule,
    TerminalTypesModule,
    ConnectivityTypesModule,
    OperationOrdersModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
