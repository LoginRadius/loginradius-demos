import { $, $$ } from './dom';

export type ScreenName =
  | 'email'
  | 'password'
  | 'signup'
  | 'loading'
  | 'notice';

export const showScreen = (name: ScreenName): void => {
  $$('.screen').forEach((el) => el.classList.remove('active'));
  $(`[data-screen="${name}"]`).classList.add('active');
};

export const showAuthCard = (): void => {
  $('#auth-card').hidden = false;
  $('#profile-card').hidden = true;
};

export const showProfileCard = (): void => {
  $('#auth-card').hidden = true;
  $('#profile-card').hidden = false;
};

export const setLoadingText = (text: string): void => {
  $('#loading-text').textContent = text;
};

export const setNoticeText = (text: string): void => {
  $('#notice-text').textContent = text;
};
