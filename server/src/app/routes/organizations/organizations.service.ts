import { Component } from "@nestjs/common";
import { Repository } from "typeorm";
import { DatabaseService } from "../../core/shared/database.service";
import { Organization } from "./organization.entity";

@Component()
export class OrganizationsService {
  private get repository(): Promise<Repository<Organization>> {
    return this.databaseService.getRepository(Organization);
  }

  constructor(private databaseService: DatabaseService) { }

  public async getAll(): Promise<Organization[]> {
    const repository = await this.repository;
    const organizations = await repository.find();
    return organizations;
  }

  public async post(organization: Organization): Promise<Organization> {
    const repository = await this.repository;
    const newOrganization = await repository.persist(organization);
    return newOrganization;
  }
}
