import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { IAuthRepository } from '../../../core/shared/application/ports/IAuthRepository.interface';
import { AuthLocalStorageService } from '../../../core/shared/infraestructure/local-storage/auth-local-storage.service';

export const hasConfirm: CanActivateFn = (route, state) => {

  const _authRepository:IAuthRepository= new AuthLocalStorageService()
  const router = inject(Router);
  console.log(_authRepository.getDateCode());

  if(!_authRepository.getDateCode().hasValue()) {
    router.navigateByUrl('/home')
    return false;
  }

  return true
};
