import { Module } from '@nestjs/common';
import { AuthController } from './http/auth.controller';
import { AuthService } from './services/auth.service';

@Module({
  imports: [],
  controllers: [AuthController],   // 반드시 등록
  providers: [AuthService],        // 반드시 등록
})
export class AppModule {}
