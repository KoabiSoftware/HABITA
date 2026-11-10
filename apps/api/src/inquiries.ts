import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Module,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  Equals,
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
} from "class-validator";
import { Database } from "./database";
import { AuthModule, SessionGuard, AdminGuard } from "./auth";
class InquiryDto {
  @IsString() @Length(2, 80) name: string;
  @IsEmail() email: string;
  @IsString() @Matches(/^[+\d\s()-]{7,25}$/) phone: string;
  @IsString() @Length(15, 2000) message: string;
  @Equals(true) consent: boolean;
  @IsOptional() @IsString() propertyId?: string;
}
@Controller("inquiries")
class InquiriesController {
  constructor(private db: Database) {}
  @Post() async create(@Body() dto: InquiryDto) {
    if (
      dto.propertyId &&
      !(await this.db.property.count({
        where: {
          id: dto.propertyId,
          status: { in: ["AVAILABLE", "RESERVED"] },
        },
      }))
    )
      throw new BadRequestException("Propiedad no disponible.");
    const record = await this.db.inquiry.create({ data: dto });
    return {
      id: record.id,
      message:
        "Tu solicitud quedó registrada. Conserva este código para consultarla.",
    };
  }
  @Get() @UseGuards(SessionGuard, AdminGuard) list() {
    return this.db.inquiry.findMany({
      include: { property: { select: { title: true } } },
      take: 100,
      orderBy: { createdAt: "desc" },
    });
  }
}
@Module({ imports: [AuthModule], controllers: [InquiriesController] })
export class InquiriesModule {}
