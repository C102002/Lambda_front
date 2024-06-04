import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AuthStatus } from '../interfaces/auth-status.enum';
import { enviroment } from '../../../env/enviroments';
import { LocalStorage } from '../services/LocalStorage';

export const hasCodeGuard: CanActivateFn = (route, state) => {

  const authService=inject(AuthService)

  const router = inject(Router);
  // if (!enviroment.production) {
  //   return true
  // }

  if(authService._hasCode) {
   return true}
  else{
    router.navigateByUrl('/auth/resetpassword')
    return false;
  }
};
