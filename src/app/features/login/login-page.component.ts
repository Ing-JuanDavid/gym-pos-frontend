import {
    Component,
    inject
} from '@angular/core';

import {
    FormsModule
} from '@angular/forms';

import {
    Router
} from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './login-page.component.html'
})
export class LoginComponent {

    private readonly auth =
        inject(AuthService);

    private readonly router =
        inject(Router);

    username = '';

    password = '';

    error = '';

    login(): void {

        const success =
            this.auth.login(
                this.username,
                this.password
            );

        if (!success) {

            this.error =
                'Usuario o contraseña inválidos';

            return;

        }

        this.router.navigate(['/']);

    }

}