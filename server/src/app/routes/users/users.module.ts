import { MiddlewaresConsumer, Module, RequestMethod } from '@nestjs/common';
import { AuthMiddleware } from './../../core/shared/auth.middleware';
import { RolesMiddleware } from './../../core/shared/roles.middleware';
import { SharedModule } from './../../core/shared/shared.module';
import { ROLES } from './user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

const roles = [ROLES.ADMIN];

@Module({
    components: [UsersService],
    controllers: [UsersController],
    exports: [UsersService],
    modules: [SharedModule],
})
export class UsersModule {
    public configure(consumer: MiddlewaresConsumer) {
        consumer.apply(AuthMiddleware).forRoutes(UsersController)
            .apply(RolesMiddleware).with(roles).forRoutes(UsersController);
    }
}
