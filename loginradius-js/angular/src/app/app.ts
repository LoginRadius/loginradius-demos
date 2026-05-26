import { Component, OnInit } from '@angular/core';
import { LoginRadiusSDK } from '@loginradius/loginradius-js';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  ngOnInit() {
    // Initialize LoginRadius SDK
    const loginRadius = new LoginRadiusSDK({
      apiKey: environment.loginradiusApiKey,
      sott: environment.loginradiusSott,
    });

    // Initialize login interface
    loginRadius.init('auth', {
      container: 'auth-container',
      onSuccess: (response: unknown) => {
        console.log('Login response:', response);
      },
      onError: (error: { error?: string; errorCode?: number }) => {
        console.error('Login error:', error);
      },
    });
  }
}
