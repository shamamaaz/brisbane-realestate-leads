import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivate,
    Router,
    RouterStateSnapshot,
} from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): boolean {
    const userRole = localStorage.getItem('role');
    const requiredRole = route.data['role'];

    if (userRole === requiredRole) {
      return true;
    }

    // Redirect to home if role doesn't match
    console.warn(
      `User role '${userRole}' does not match required role '${requiredRole}'`,
    );
    this.router.navigate(['/']);
    return false;
  }
}
