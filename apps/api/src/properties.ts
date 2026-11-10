import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Injectable,
  Module,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
  Max,
  IsNumber,
  Matches,
} from "class-validator";
import { Transform, Type } from "class-transformer";
import { Operation, Prisma, PropertyStatus } from "@prisma/client";
import { Database } from "./database";
import { AdminGuard, AuthModule, SessionGuard } from "./auth";
const include = {
  category: true,
  location: true,
  media: { orderBy: { position: "asc" as const } },
};
const optionalPrice = ({ value }: { value: unknown }) =>
  value == null || (typeof value === "string" && value.trim() === "")
    ? undefined
    : Number(value);
export class SearchDto {
  @IsOptional() @IsEnum(Operation) operation?: Operation;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @Transform(optionalPrice) @IsInt() @Min(0) maxPrice?: number;
  @IsOptional() @Transform(optionalPrice) @IsInt() @Min(0) minPrice?: number;
  @IsOptional() @IsString() @Length(0, 80) q?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page: number = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(30) limit: number =
    12;
  @IsOptional()
  @IsEnum({ priceAsc: "priceAsc", priceDesc: "priceDesc", newest: "newest" })
  sort?: string;
}
export class PropertyDto {
  @IsString() @Length(3, 120) title: string;
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  @Length(3, 140)
  slug: string;
  @IsString() @Length(20, 5000) description: string;
  @IsNumber() @Min(1) price: number;
  @IsInt() @Min(1) area: number;
  @IsInt() @Min(0) bedrooms: number;
  @IsInt() @Min(0) bathrooms: number;
  @IsInt() @Min(0) parking: number;
  @IsEnum(Operation) operation: Operation;
  @IsEnum(PropertyStatus) status: PropertyStatus;
  @IsBoolean() featured: boolean;
  @IsArray() @IsString({ each: true }) amenities: string[];
  @IsString() @Length(3, 200) address: string;
  @IsString() categoryId: string;
  @IsString() locationId: string;
}
@Injectable()
export class PropertiesService {
  constructor(private db: Database) {}
  async search(dto: SearchDto) {
    const where: Prisma.PropertyWhereInput = {
      status: { in: ["AVAILABLE", "RESERVED"] },
      operation: dto.operation,
      locationId: dto.location || undefined,
      categoryId: dto.category || undefined,
      price: { gte: dto.minPrice, lte: dto.maxPrice },
      ...(dto.q
        ? {
            OR: [
              { title: { contains: dto.q, mode: "insensitive" } },
              { description: { contains: dto.q, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    const [items, total] = await this.db.$transaction([
      this.db.property.findMany({
        where,
        include,
        skip: (dto.page - 1) * dto.limit,
        take: dto.limit,
        orderBy:
          dto.sort === "priceAsc"
            ? { price: "asc" }
            : dto.sort === "priceDesc"
              ? { price: "desc" }
              : [{ featured: "desc" }, { title: "asc" }],
      }),
      this.db.property.count({ where }),
    ]);
    return {
      items,
      total,
      page: dto.page,
      pages: Math.ceil(total / dto.limit),
    };
  }
  async detail(slug: string) {
    const p = await this.db.property.findFirst({
      where: { slug, status: { in: ["AVAILABLE", "RESERVED"] } },
      include,
    });
    if (!p) throw new NotFoundException("Propiedad no encontrada.");
    return p;
  }
  async validateRelations(d: PropertyDto) {
    if (
      !(await this.db.location.count({ where: { id: d.locationId } })) ||
      !(await this.db.category.count({ where: { id: d.categoryId } }))
    )
      throw new BadRequestException("Ubicación o tipo no válidos.");
  }
}
@Controller("properties")
class PropertiesController {
  constructor(private service: PropertiesService) {}
  @Get() list(@Query() dto: SearchDto) {
    return this.service.search(dto);
  }
  @Get(":slug") detail(@Param("slug") slug: string) {
    return this.service.detail(slug);
  }
}
@Controller("admin/properties")
@UseGuards(SessionGuard, AdminGuard)
class AdminPropertiesController {
  constructor(
    private db: Database,
    private service: PropertiesService,
  ) {}
  @Get() list() {
    return this.db.property.findMany({
      include,
      orderBy: { updatedAt: "desc" },
    });
  }
  @Post() async create(@Body() dto: PropertyDto) {
    await this.service.validateRelations(dto);
    try {
      return await this.db.property.create({ data: dto, include });
    } catch (e: any) {
      if (e.code === "P2002")
        throw new BadRequestException("El identificador ya existe.");
      throw e;
    }
  }
  @Patch(":id") async update(
    @Param("id") id: string,
    @Body() dto: PropertyDto,
  ) {
    await this.service.validateRelations(dto);
    try {
      return await this.db.property.update({
        where: { id },
        data: dto,
        include,
      });
    } catch (e: any) {
      if (e.code === "P2025") throw new NotFoundException();
      if (e.code === "P2002")
        throw new BadRequestException("El identificador ya existe.");
      throw e;
    }
  }
  @Delete(":id") async archive(@Param("id") id: string) {
    try {
      return await this.db.property.update({
        where: { id },
        data: { status: "ARCHIVED" },
      });
    } catch {
      throw new NotFoundException();
    }
  }
}
@Module({
  imports: [AuthModule],
  controllers: [PropertiesController, AdminPropertiesController],
  providers: [PropertiesService],
})
export class PropertiesModule {}
