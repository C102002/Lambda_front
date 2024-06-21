import { Component, computed, effect, inject, signal } from '@angular/core';
import { EventType, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { BottomBarComponent } from './components/bottom-bar/bottom-bar.component';
import { Subscription, filter } from 'rxjs';
import { AuthStatus } from '../../../../core/user/domain/interfaces/auth-status.enum';
import { LoaderComponent } from "../../../auth/components/loader/loader.component";
import { UserStatusService } from '../../../../core/user/infraestructure/services/user-status.service';
import { AuthLoadingStore } from '../../../../core/user/infraestructure/auth-loading-store';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgClass } from '@angular/common';
import { IRouterRepository } from '../../../../core/shared/application/ports/IRouterRepository.interface';
import { routerLocalStorageRepository } from '../../../../core/shared/infraestructure/local-storage/router-local-storage.service';

const BOTTOM_NAVIGATION_BAR_BLACK_LIST: RegExp[] = [
  /\/home\/blogs-details\?id=.+/
]
@Component({
  standalone: true,
  selector: 'app-layout-page',
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
  imports: [
    RouterOutlet,
    SidebarComponent,
    BottomBarComponent,
    LoaderComponent,
    NgClass
  ]
})

export class LayoutComponent {
  public subscriber?: Subscription;
  public isBottombarActive = signal<boolean>(false);
  constructor(private router: Router) { }
  private AuthLoadingStore=AuthLoadingStore.getInstance();
  private UserStatus= toSignal(this.AuthLoadingStore.getObservable())
  private _routerRepository:IRouterRepository= new routerLocalStorageRepository()
  public finishedAuthCheck= computed<boolean>(()=>{
    if (this.UserStatus()===AuthStatus.checking) return false
    return true
  })

  ngOnInit() {
    this.checkBottomBarStatus(this.router.url)

    this.subscriber = this.router.events.pipe(
      filter(event => event.type===EventType.NavigationEnd)
    ).subscribe((event) => {
      if(event.type===EventType.NavigationEnd){
        this.checkBottomBarStatus(event.url)
        this._routerRepository.saveLastLink(event.url)
      }
    });
  }

  checkBottomBarStatus(currentUrl: string) {
    for (const regexRoute of BOTTOM_NAVIGATION_BAR_BLACK_LIST) {
      const isInvalidURL = regexRoute.test(currentUrl)
      if (isInvalidURL)
        this.isBottombarActive.set(false);
      else
        this.isBottombarActive.set(true)
    }
  }

  ngOnDestroy() {
    this.subscriber?.unsubscribe();
  }
}
