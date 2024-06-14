import { Observable } from "rxjs";
import { LoginUserData } from "../../infraestructure/dto/entry/login-auth.interface";
import { User } from "../user";
import { Result } from "../../../../common/helpers/Result";

export interface IAuthApiService{
  login(loginUserData:LoginUserData): Observable<Result<User>>
}
