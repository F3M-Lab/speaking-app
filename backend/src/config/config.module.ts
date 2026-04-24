import { Module, Global } from '@nestjs/common';
import * as dotenv from 'dotenv';

dotenv.config();

@Global()
@Module({})
export class ConfigModule {}
