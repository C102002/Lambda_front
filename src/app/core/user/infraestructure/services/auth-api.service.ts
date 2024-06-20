import { IAuthApiService } from '../../domain/interfaces/auth-api.interface';
import { LoginEntryDomainDTO  } from '../../domain/interfaces/entry/login-entry.dto';
import { SignUpEntryDomainDTO } from '../../domain/interfaces/entry/signup-entry.dto';
import { Type } from '../../domain/interfaces/type.interface';
import { AppUser } from '../../domain/appuser';




import { LoginResponse } from '../dto/response/login-response.interface';
import { SignUpResponse } from '../dto/response/signup-response.interface';
import { User } from '../dto/response/user-response.interface';

import { AuthLocalStorageService } from '../../../shared/infraestructure/local-storage/auth-local-storage.service';
import { enviroment } from '../../../../../environments/environment';
import { IAuthRepository } from '../../../shared/application/ports/IAuthRepository.interface';
import { Result } from '../../../../common/helpers/Result';


import { Observable, catchError, map, of, switchMap, throwError } from 'rxjs';
import { Injectable, Optional, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponseBase } from '@angular/common/http';
import { GetCodeResponse } from '../dto/response/getCode-response.interface';
import { UserStatusService } from './user-status.service';
import { AuthLoadingStore } from '../auth-loading-store';
import { AuthStatus } from '../../domain/interfaces/auth-status.enum';


@Injectable({
  providedIn: 'root'
})

export class AuthApiService implements IAuthApiService {
  private _httpClient = inject(HttpClient);
  readonly BASE_URL:string= enviroment.baseUrl+`/auth`
  private _authRepository:IAuthRepository= new AuthLocalStorageService()
  private _userStatus:UserStatusService = inject(UserStatusService)
  private _status:AuthLoadingStore=AuthLoadingStore.getInstance()

  constructor() {}

  login(LoginEntryDomainDTO: LoginEntryDomainDTO): Observable<Result<AppUser>> {
    const body={...LoginEntryDomainDTO}
    const url=`${this.BASE_URL}/login`
    this._status.store(AuthStatus.checking)
    return this._httpClient.post<LoginResponse>(url,body)
      .pipe(
        map((response)=>{
          this._authRepository.saveToken(response.token)
          this._status.store(AuthStatus.authenticated)
          let type:Type=Type.CLIENT
          if(response.type===Type.CLIENT) type=Type.CLIENT
          if(response.type===Type.ADMIN) type=Type.ADMIN
          return Result.makeResult(new AppUser({...response.user,type}))
        }),
        catchError(error=>{
          this._status.store(AuthStatus.notAuthenticated)
          return throwError(()=>Result.makeError(new Error(error.error.message)))
        })
      )
  }

  currentUser(): Observable<Result<AppUser>> {
    const url=`${this.BASE_URL}/current`
    const token=this._authRepository.getToken()

    if( !token.hasValue()) return of ()

    const headers= new HttpHeaders()
    .set('Authorization',`Bearer ${token.getValue()}`)
    this._userStatus.setChecking()


    return this._httpClient.get<User>(url,{headers})
      .pipe(
        map((response)=>{
          let type= Type.CLIENT
          this._userStatus.setAuthenticated()
          console.log(this._userStatus.currentStatus());
          return Result.makeResult(new AppUser({...response,type}))
        }),
        catchError(error=>{
          this._userStatus.setNotAuthenticated()
          return throwError(()=>Result.makeError(new Error(error.error.message)))
        })
      )
    }

    signup(user: SignUpEntryDomainDTO): Observable<Result<AppUser>> {
      const url=`${this.BASE_URL}/register`
      const body={...user}
      this._userStatus.setChecking()

      return this._httpClient.post<SignUpResponse>(url,body)
        .pipe(
          switchMap((response)=>{
            this._userStatus.setAuthenticated()
            let answer=this.login({email:user.email,password:user.password})
            return answer
          }),
          catchError(error=>{
            this._userStatus.setNotAuthenticated()
            return throwError(()=>Result.makeError(new Error(error.error.message)))
          })
        )
    }

    getCodeUpdatePassword(email:string):Observable<void>{
      const url=`${this.BASE_URL}/forget/password`;
      const body={email}
      this._userStatus.setChecking()
      return this._httpClient.post<GetCodeResponse>(url,body)
      .pipe(
        map((response)=>{
          this._authRepository.saveEmail(email)
          this._authRepository.saveDateCode(response.date.toString())
          this._userStatus.setNotAuthenticated()
          return
        }),
        catchError(error=>{
          this._userStatus.setNotAuthenticated()
          return throwError(()=>error.error.message)
        })
      )
    }


  verificateCode(code:string):Observable<number>{
    let email=this._authRepository.getEmail()
    const url=`${this.BASE_URL}/code/validate`

    if (!email.hasValue()) return of ()
    this._userStatus.setChecking();
    const body={email:email.getValue(),code}

    return this._httpClient.post<HttpResponseBase>(url,body,{ observe: 'response' })
      .pipe(
        map((response)=>{
          this._userStatus.setNotAuthenticated()
          this._authRepository.saveCode(code)
          return response.status
        }),
        catchError(error=>{
          this._userStatus.setNotAuthenticated()
          return throwError(()=>error.error.message)
        })
      )

  }

    updatePassword(password:string):Observable<Number>{

      const url=`${this.BASE_URL}/change/password`
      let email=this._authRepository.getEmail()
      let code=this._authRepository.getCode()

      if (!email.hasValue()) return of()
      if (!code.hasValue()) return of()

      const body={
        email:email.getValue(),
        password,
        code:code.getValue()
      }
      this._userStatus.setChecking();

      return this._httpClient.put<HttpResponseBase>(url,body,{ observe: 'response' })
        .pipe(
          map((response)=>{
            this._userStatus.setNotAuthenticated()
            return response.status
          }),
          catchError(error=>{
            this._userStatus.setNotAuthenticated()
            return throwError(()=>error.error.message)
          })
        )
      }

      logout (): void {
        this._authRepository.deleteToken();
        this._userStatus.setNotAuthenticated()
        this._userStatus.deleteUser()
      }

}
