import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { enviroment } from '../../../../environments/environment';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { AuthStatus } from '../interfaces/auth-status.enum';
import { LoginResponse } from '../interfaces/response/login-response.interface';
import { User } from '../interfaces/user-state.interface';
import { SignUpUser } from '../interfaces/signup-user.interface';
import { SignUpResponse } from '../interfaces/response/signup-response.interface';
import { GetCodeResponse } from '../interfaces/response/getCode-response.interface';
import { LocalStorage } from './LocalStorage';
import { VerificationCodeForm } from '../interfaces/forms/verticationCode-form.interface';
import { FormGroup } from '@angular/forms';
import { Optional } from '../../shared/helpers/Optional';
import { UpdatePasswordResponse } from '../interfaces/response/updatePassword-response.interface';
import { CheckTokenResponse } from '../interfaces/response/checkToken-response.interface';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  private router = inject(Router);
  private readonly baseUrl:string= enviroment.baseUrl
  private http= inject(HttpClient)
  private _currentUser=signal <User |null>(null)
  private _authStatus= signal<AuthStatus>(AuthStatus.notAuthenticated);
  private localStorage:LocalStorage= new LocalStorage('','');
  private code=new Optional<string>(undefined);
  private email='';
  public currentUser=computed(()=>this._currentUser);
  public _hasCode=(false);
  public _hasCodeVerified=(false);
  public authStatus=computed(()=>this._authStatus());
  private _hasError:boolean=false;
  public hasError=this._hasError

  constructor() {
    this.checkAuthStatus().subscribe()
  }

  private changeError(){
    this._hasError=!this._hasError
  }
  private setAuthtication(newUser:User):boolean{
    this._currentUser.set(newUser)
    this.setAuthenticaded()
    console.log(this._currentUser());
    return true
  }

  private setChecking():void{
    this._authStatus.set(AuthStatus.checking)
  }

  private setAuthenticaded():void{
    this._authStatus.set(AuthStatus.authenticated)
  }
  private setNotAuthenticated():void{
    this._authStatus.set(AuthStatus.notAuthenticated)
  }

  private createUser(responseData:LoginResponse):User{
    const {token,type,...response}= responseData
    let newUser:User={
      ...response.user
    }
    return newUser
  }

  current():Observable<boolean>{
    const url=`${this.baseUrl}/auth/current`
    const token=this.localStorage.LoadLocalStorage('token')

    if( !token.hasValue()) return (of(false))

    const headers= new HttpHeaders()
    .set('Authorization',`Bearer ${token.getValue()}`)

    return this.http.get<User>(url,{headers})
      .pipe(
        map((response)=>{
          return true
        })
      )
  }


  login(email:string,password:string):Observable<boolean>{

    const url=`${this.baseUrl}/auth/login`
    const body={email,password}
    this.setChecking();

    return this.http.post<LoginResponse>(url,body)
      .pipe(
        map((response)=>{
          let newUser=this.createUser(response);
          this.localStorage.SaveLocalStorage('token',response.token)
          return this.setAuthtication(newUser)
          // console.log(response);
        }),
        catchError(error=>{
          this.setNotAuthenticated();
          console.log(error);
          this.changeError();
          return throwError(()=>error.error.message)
        })
      )
    }

    signup(user:SignUpUser):Observable<boolean>{

      const url=`${this.baseUrl}/auth/register`
      const body={...user}
      this.setChecking();

      return this.http.post<SignUpResponse>(url,body)
        .pipe(
          map((response)=>{
            this.login(user.email,user.password)
            this.setAuthenticaded();

            return true
            // console.log(response);
          }),
          catchError(error=>{
            this.setNotAuthenticated();
            console.log(error);
            return throwError(()=>error.error.message)
          })
        )
      }

  getCodeUpdatePassword(email:string):Observable<GetCodeResponse>{

    const url=`${this.baseUrl}/auth/getcodeupdatepassword`;
    const body={email}
    this.localStorage.SaveLocalStorage('email',email)
    this.setChecking();

    return this.http.post<GetCodeResponse>(url,body)
      .pipe(
        map((response)=>{
          this.localStorage.SaveLocalStorage('date',response.date.toString())
          this._hasCode=true
          this.email=response.email
          this.code.setValue(response.code);
          console.log(response.code);
          this.setNotAuthenticated();

          // console.log(JSON.stringify(this._hasCode));
          return response
        }),
        catchError(error=>{
          this.setNotAuthenticated();
          console.log(error);
          return throwError(()=>error.error.message)
        })
      )
  }

  checkAuthStatus():Observable<boolean>{
    const url=`${this.baseUrl}/auth/checktoken`;
    const token=this.localStorage.LoadLocalStorage('token')

    if (!token.hasValue()) return (
      this.logout(),
      of(false))

    const headers= new HttpHeaders()
      .set('Authorization',`Bearer ${token.getValue()}`)

    return this.http.get<CheckTokenResponse>(url,{headers})
      .pipe(
        map((resp)=>{
          if (resp.tokenIsValid) this.setAuthenticaded()
          else this.setNotAuthenticated()
          return resp.tokenIsValid
        }),
        catchError(()=>of(false))
      )
  }

  verificateLocalCode(verificationCodeForm:FormGroup<VerificationCodeForm>):boolean{
    let data=verificationCodeForm.value
    let numbers=Object.values(data);
    let code:string=numbers.join('')
    this.setChecking();

    // console.log(this.code.getValue());
    // console.log(code);

    if (this.code.hasValue()){
      if (this.code.getValue()===code){
        this.setNotAuthenticated();
        this._hasCodeVerified=true
        // this.localStorage.deleteLocalStorage('code')
        return true
      }
    }
    this.setNotAuthenticated();
    return false
  }

  updatePassword(password:string):Observable<boolean>{

    const url=`${this.baseUrl}/auth/updatepassword`
    const body={
      email:this.email,
      password,
      code:this.code.getValue()
    }
    this.setChecking();

    console.log(body);

    return this.http.post<UpdatePasswordResponse>(url,body)
      .pipe(
        map((response)=>{
          this.setNotAuthenticated()
          return true
        }),
        catchError(error=>{
          this.setNotAuthenticated()
          console.log(error);
          return throwError(()=>error.error.message)
        })
      )
    }



  logout (): void {
    this.localStorage.deleteLocalStorage('token');
    this.setNotAuthenticated()
    this._currentUser.set(null)
    this.router.navigate(['/auth'])
  }
}
