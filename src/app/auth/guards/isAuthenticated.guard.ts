import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AuthStatus } from '../interfaces/auth-status.enum';

export const isAuthenticatedGuard: CanActivateFn = (route, state) => {
  //TODO: PILAS CON ESTO, ES SOLO CON FINES DE DESARROLLO
  return true;
  const authService=inject(AuthService)
  const router = inject(Router);

  if(authService.authStatus()=== AuthStatus.authenticated) return true
  else{
    router.navigateByUrl('/auth/home')
    return false;
  }
};
