import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { AuthMockController } from './auth-mock.controller';
import { PermissionsMockController } from './permissions-mock.controller';

// Function to resolve env dynamically in case dotenv loads later
const isMockMode = () => process.env.USE_MOCK_AUTH?.trim() === 'true';

@Module({
  // Dynamically load mocks if true
  controllers: isMockMode() ? [AuthMockController, PermissionsMockController] : [],
})
export class AuthProxyModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    if (!isMockMode()) {
      if (process.env.AUTH_SERVICE_URL) {
        consumer
          .apply(
            createProxyMiddleware({
              pathRewrite: (path) => path.replace('/auth', ''),
              target: process.env.AUTH_SERVICE_URL,
              changeOrigin: true,
              secure: false,
            }),
          )
          .forRoutes({ path: '/auth/(.*)', method: RequestMethod.ALL });
      }

      if (process.env.PERMISSIONS_SERVICE_URL) {
        consumer
          .apply(
            createProxyMiddleware({
              pathRewrite: (path) => path.replace('/permissions', ''),
              target: process.env.PERMISSIONS_SERVICE_URL,
              changeOrigin: true,
              secure: false,
            }),
          )
          .forRoutes({ path: '/permissions/(.*)', method: RequestMethod.ALL });
      }
    }
  }
}
