import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private readonly USERS_KEY =
        'gympos_users';

    private readonly SESSION_KEY =
        'gympos_session';

    constructor() {

        this.seedAdmin();

    }

    private seedAdmin(): void {

        const users =
            localStorage.getItem(
                this.USERS_KEY
            );

        if (users) {
            return;
        }

        localStorage.setItem(
            this.USERS_KEY,
            JSON.stringify([
                {
                    username: 'admin',
                    password: 'admin123'
                }
            ])
        );

    }

    login(
        username: string,
        password: string
    ): boolean {

        const users = JSON.parse(
            localStorage.getItem(
                this.USERS_KEY
            ) ?? '[]'
        );

        const user =
            users.find(
                (u: any) =>
                    u.username === username &&
                    u.password === password
            );

        if (!user) {
            return false;
        }

        localStorage.setItem(
            this.SESSION_KEY,
            JSON.stringify(user)
        );

        return true;

    }

    logout(): void {

        localStorage.removeItem(
            this.SESSION_KEY
        );

    }

    getCurrentUser() {

        const session =
            localStorage.getItem(
                'gympos_session'
            );

        if (!session) {
            return null;
        }

        return JSON.parse(session);

    }




    isAuthenticated(): boolean {

        return !!localStorage.getItem(
            this.SESSION_KEY
        );

    }

}