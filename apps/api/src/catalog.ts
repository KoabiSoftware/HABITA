import { Controller, Get, Module } from "@nestjs/common";
import { Database } from "./database";
@Controller("categories")
class CategoriesController {
  constructor(private db: Database) {}
  @Get() list() {
    return this.db.category.findMany({ orderBy: { name: "asc" } });
  }
}
@Controller("locations")
class LocationsController {
  constructor(private db: Database) {}
  @Get() list() {
    return this.db.location.findMany({ orderBy: { name: "asc" } });
  }
}
@Module({ controllers: [CategoriesController] })
export class CategoriesModule {}
@Module({ controllers: [LocationsController] })
export class LocationsModule {}
