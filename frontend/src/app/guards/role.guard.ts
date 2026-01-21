import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): boolean {
    const userRole = this.authService.getRole();
    const requiredRoles = route.data['roles'] as string[] | undefined;

    if (!requiredRoles || (userRole && requiredRoles.includes(userRole))) {
      return true;
    }

    // Redirect to home if role doesn't match
    console.warn(
      `User role '${userRole}' does not match required roles '${requiredRoles}'`,
    );
    this.router.navigate(['/']);
    return false;
  }
}
