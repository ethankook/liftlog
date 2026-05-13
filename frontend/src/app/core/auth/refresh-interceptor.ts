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
        return throwError(() => err);
      }

      return from(auth.refresh()).pipe(
        switchMap((authResponse) => {
          return next(
            req.clone({
              setHeaders: { Authorization: `Bearer ${authResponse.accessToken}` },
            }),
          );
        }),
        catchError((refreshErr) => {
          router.navigateByUrl('/login');
          return throwError(() => refreshErr);
        }),
      );
    }),
  );
};
