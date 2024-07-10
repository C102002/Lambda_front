import { Injectable } from "@angular/core";
import { AuthLocalStorageService } from "../../../shared/infraestructure/local-storage/auth-local-storage.service";
import { AddSectionAdminUseCase } from "../../application/add-section-use-case.service";
import { AddSectionApiService } from "../services/AddSectionApiService.service";

@Injectable({ providedIn: "root" })

export class AddSectionApiProvider {

  public usecase: AddSectionAdminUseCase;

  constructor(){
    this.usecase=new AddSectionAdminUseCase(new AddSectionApiService(new AuthLocalStorageService))
  }
}
