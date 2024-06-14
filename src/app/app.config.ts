import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideTransloco } from '@jsverse/transloco';

import { inMemoryScrollingFeature, routes } from './app.routes';
import { TranslocoHttpLoader } from './transloco-loader';
import { authInterceptor } from './presentation/shared/interceptors/auth/auth.interceptor';
import { COURSE_API_PROVIDER } from './core/course/infrastructure/providers/course-api-provider';
import { CATEGORY_API_PROVIDER } from './core/categories/infrastructure/providers/category-api-provider';
import { TRAINER_API_PROVIDER } from './core/trainer/infrastructure/providers/trainer-api-provider';
import { BLOG_API_PROVIDER } from './core/blog/infrastructure/providers/blog-api-provider';
import { SEARCH_API_PROVIDER } from './core/search/infraestructure/providers/search-api-provider';
import { NOTIFICATION_API_PROVIDER } from './core/notification/infrastructure/providers/notification-api-provider';
import { AUTH_API_PROVIDER } from './core/user/infraestructure/providers/auth-api-provider';
import { USER_API_PROVIDER } from './core/user/infraestructure/providers/user-status-provider';
import { COMMENT_API_PROVIDER } from './core/comments/infraestructure/providers/comment-api-provider';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, inMemoryScrollingFeature),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideTransloco({
      config: {
        availableLangs: ['en', 'es'],
        defaultLang: 'en',
        // Remove this option if your application doesn't support changing language in runtime.
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: TranslocoHttpLoader
    }),
    provideAnimationsAsync(),
    COURSE_API_PROVIDER,
    CATEGORY_API_PROVIDER,
    BLOG_API_PROVIDER,
    TRAINER_API_PROVIDER,
    SEARCH_API_PROVIDER,
    NOTIFICATION_API_PROVIDER,
    AUTH_API_PROVIDER,
    USER_API_PROVIDER,
    COMMENT_API_PROVIDER
  ]
};
