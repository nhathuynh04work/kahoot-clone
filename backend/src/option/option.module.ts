import { Module } from '@nestjs/common';
import { OptionController } from './option.controller.js';
import { OptionService } from './option.service.js';

@Module({
  controllers: [OptionController],
  providers: [OptionService]
})
export class OptionModule {}
