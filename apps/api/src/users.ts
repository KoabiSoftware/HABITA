import {
  Controller,
  Delete,
  Get,
  Module,
  NotFoundException,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Database } from "./database";
import { AuthModule, AuthedRequest, SessionGuard } from "./auth";
@Controller("users")
@UseGuards(SessionGuard)
class UsersController {
  @Get("me") me(@Req() r: AuthedRequest) {
    return r.user;
  }
}
@Controller("favorites")
@UseGuards(SessionGuard)
class FavoritesController {
  constructor(private db: Database) {}
  @Get() list(@Req() r: AuthedRequest) {
    return this.db.favorite.findMany({
      where: {
        userId: r.user.id,
        property: { status: { in: ["AVAILABLE", "RESERVED"] } },
      },
      include: {
        property: { include: { location: true, category: true, media: true } },
      },
    });
  }
  @Post(":id") async add(
    @Param("id") propertyId: string,
    @Req() r: AuthedRequest,
  ) {
    if (
      !(await this.db.property.count({
        where: { id: propertyId, status: { in: ["AVAILABLE", "RESERVED"] } },
      }))
    )
      throw new NotFoundException();
    return this.db.favorite.upsert({
      where: { userId_propertyId: { userId: r.user.id, propertyId } },
      create: { userId: r.user.id, propertyId },
      update: {},
    });
  }
  @Delete(":id") async remove(
    @Param("id") propertyId: string,
    @Req() r: AuthedRequest,
  ) {
    await this.db.favorite.deleteMany({
      where: { propertyId, userId: r.user.id },
    });
    return { ok: true };
  }
}
@Module({ imports: [AuthModule], controllers: [UsersController] })
export class UsersModule {}
@Module({ imports: [AuthModule], controllers: [FavoritesController] })
export class FavoritesModule {}
