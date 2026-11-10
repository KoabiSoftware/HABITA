import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Module,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { IsEnum, IsInt, IsString, Length, Matches, Min } from "class-validator";
import { Database } from "./database";
import { AuthModule, SessionGuard, AdminGuard } from "./auth";
class MediaDto {
  @IsString() propertyId: string;
  @IsString()
  @Matches(/^(\/images\/[a-zA-Z0-9._-]+\.(webp|jpg|png)|https:\/\/[^\s]+)$/)
  url: string;
  @IsString() @Length(5, 180) alt: string;
  @IsEnum({ IMAGE: "IMAGE", VIDEO: "VIDEO" }) kind: string;
  @IsInt() @Min(0) position: number;
}
@Controller("media")
@UseGuards(SessionGuard, AdminGuard)
class MediaController {
  constructor(private db: Database) {}
  @Get(":propertyId") list(@Param("propertyId") propertyId: string) {
    return this.db.media.findMany({
      where: { propertyId },
      orderBy: { position: "asc" },
    });
  }
  @Post() async add(@Body() dto: MediaDto) {
    if (!(await this.db.property.count({ where: { id: dto.propertyId } })))
      throw new BadRequestException("Propiedad no válida.");
    return this.db.media.create({ data: dto });
  }
  @Delete(":id") async remove(@Param("id") id: string) {
    try {
      return await this.db.media.delete({ where: { id } });
    } catch {
      throw new NotFoundException();
    }
  }
}
@Module({ imports: [AuthModule], controllers: [MediaController] })
export class MediaModule {}
