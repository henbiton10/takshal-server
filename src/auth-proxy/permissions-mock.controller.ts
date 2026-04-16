import { Controller, Get, Param, Query } from '@nestjs/common';

@Controller('permissions/userPermissions')
export class PermissionsMockController {
  @Get('entities')
  getEntities(@Query('entityIds') entityIdsStr: string) {
    if (!entityIdsStr) return {};
    
    const entityIds = entityIdsStr.split(',');
    const response: Record<string, any> = {};
    
    // Grant full mock permissions (CRUD) to every requested entity
    for (const id of entityIds) {
      response[id] = {
        Read: true,
        Create: true,
        Update: true,
        Delete: true,
        Treatment: true,
      };
    }
    return response;
  }

  @Get('tags/:tagName')
  getTag(@Param('tagName') tagName: string) {
    // Always return true for development flags
    return true;
  }
}
