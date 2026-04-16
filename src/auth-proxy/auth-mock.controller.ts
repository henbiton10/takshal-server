import { Controller, Get } from '@nestjs/common';

@Controller('auth')
export class AuthMockController {
  @Get('login')
  login() {
    // A simple 200 OK indicating successful mock login
    return { status: 'mock_logged_in' };
  }
}
