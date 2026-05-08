import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from './auth.service';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, from, switchMap, throwError } from 'rxjs';

export const refreshInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  //prevent infinite loops
  if (req.url.includes('/auth/refresh') || req.url.includes('/auth/login')) {
    return next(req);
  }

  return next(req).pipe(
    catchError((err) => {
      if (!(err instanceof HttpErrorResponse) || err.status != 401) {
        console.log('interceptor caught error:', err.status, err);

        return throwError(() => err);
      }

      return from(auth.refresh()).pipe(
        switchMap((authResponse) => {
          console.log('refresh succeeded, retrying original request');

          return next(
            req.clone({
              setHeaders: { Authorization: `Bearer ${authResponse.accessToken}` },
            }),
          );
        }),
        catchError((refreshErr) => {
          console.log('refresh failed:', refreshErr);

          router.navigateByUrl('/login');
          return throwError(() => refreshErr);
        }),
      );
    }),
  );
};
