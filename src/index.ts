export interface PasswordReset {
  username: string;
  passcode: string;
  password: string;
}

export interface PasswordChange {
  step?: number;
  username: string;
  passcode?: string;
  currentPassword: string;
  password: string;
  senderType?: string;
}
export const simplePassword = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
export const mediumPassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;
export const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export interface PasswordService {
  forgotPassword(contact: string): Promise<boolean>;
  resetPassword(pass: PasswordReset): Promise<boolean|number>;
  changePassword(pass: PasswordChange): Promise<boolean|number>;
}

interface Headers {
  [key: string]: any;
}

export interface HttpRequest {
  get<T>(url: string, options?: { headers?: Headers; }): Promise<T>;
  delete<T>(url: string, options?: { headers?: Headers; }): Promise<T>;
  post<T>(url: string, obj: any, options?: { headers?: Headers; }): Promise<T>;
  put<T>(url: string, obj: any, options?: { headers?: Headers; }): Promise<T>;
  patch<T>(url: string, obj: any, options?: { headers?: Headers; }): Promise<T>;
}

export class PasswordWebClient implements PasswordService {
  constructor(protected http: HttpRequest, protected serviceUrl: string) {
  }

  forgotPassword(contact: string): Promise<boolean> {
    const url = this.serviceUrl + '/forgot/' + contact;
    return this.http.get<boolean>(url);
  }

  resetPassword(password: PasswordReset): Promise<boolean|number> {
    const url = this.serviceUrl + '/reset';
    return this.http.post<boolean>(url, password);
  }

  changePassword(pass: PasswordChange): Promise<boolean|number> {
    const url = this.serviceUrl + '/change';
    return this.http.put<boolean>(url, pass);
  }
}

export interface ResourceService {
  resource(): any;
  value(key: string, param?: any): string;
  format(...args: any[]): string;
}

export interface LoadingService {
  showLoading(firstTime?: boolean): void;
  hideLoading(): void;
}

export function isEmpty(str: string): boolean {
  return (!str || str === '');
}

export function validateContact(contact: string, key: string, r: ResourceService, showError: (msg: string, field?: string) => void, reg?: RegExp): boolean {
  if (isEmpty(contact)) {
    const msg = r.format(r.value('error_required'), r.value(key));
    showError(msg, 'contact');
    return false;
  }
  if (reg && !reg.test(contact)) {
    const msg = r.value('error_contact_exp');
    showError(msg, 'contact');
    return false;
  }
  return true;
}
export async function forgotPassword (
    passwordService: PasswordService,
    contact: string, r: ResourceService,
    showMessage: (msg: string, field?: string) => void,
    showError: (msg: string, field?: string) => void,
    handleError: (err: any) => void,
    loading?: LoadingService) {
  try {
    if (loading) {
      loading.showLoading();
    }
    const result = await passwordService.forgotPassword(contact);
    if (result) {
      const msg =  r.value('success_forgot_password');
      showMessage(msg, 'contact');
    } else {
      const msg = r.value('fail_forgot_password');
      showError(msg, 'contact');
    }
  } catch (err) {
    handleError(err);
  }
  finally {
    if (loading) {
      loading.hideLoading();
    }
  }
}
export async function validateAndForgotPassword (
    passwordService: PasswordService,
    contact: string,
    key: string,
    r: ResourceService,
    showMessage: (msg: string, field?: string) => void,
    showError: (msg: string, field?: string) => void,
    hideMessage: (field?: string) => void,
    validateC: (u: string, k: string, r2: ResourceService, showE2: (msg: string, field?: string) => void, re?: RegExp) => boolean,
    handleError: (err: any) => void,
    reg?: RegExp,
    loading?: LoadingService) {
  if (!validateC(contact, key, r, showError, reg)) {
    return;
  } else {
    hideMessage();
  }
  forgotPassword(passwordService, contact, r, showMessage, showError, handleError, loading);
}

export function validateReset(user: PasswordReset, confirmPassword: string, r: ResourceService, showError: (msg: string, field?: string) => void, reg?: RegExp): boolean {
  if (isEmpty(user.username)) {
    const msg = r.format(r.value('error_required'), r.value('username'));
    showError(msg, 'username');
    return false;
  } else if (isEmpty(user.passcode)) {
    const msg = r.format(r.value('error_required'), r.value('passcode'));
    showError(msg, 'passcode');
    return false;
  } else if (isEmpty(user.password)) {
    const msg = r.format(r.value('error_required'), r.value('new_password'));
    showError(msg, 'password');
    return false;
  }
  if (reg && !reg.test(user.password)) {
    const msg = r.format(r.value('error_password_exp'), r.value('new_password'));
    showError(msg, 'password');
    return false;
  }
  if (user.password !== confirmPassword) {
    const msg = r.value('error_confirm_password');
    showError(msg, 'confirmPassword');
    return false;
  }
  return true;
}
export async function resetPassword (
    passwordService: PasswordService,
    user: PasswordReset, r: ResourceService,
    showMessage: (msg: string, field?: string) => void,
    showError: (msg: string, field?: string) => void,
    handleError: (err: any) => void,
    loading?: LoadingService) {
  try {
    if (loading) {
      loading.showLoading();
    }
    const success = await passwordService.resetPassword(user);
    if (success === true || success === 1) {
      const msg = r.value('success_reset_password');
      showMessage(msg);
    } else {
      const msg = r.value('fail_reset_password');
      showError(msg);
    }
  } catch (err) {
    handleError(err);
  }
  finally {
    if (loading) {
      loading.hideLoading();
    }
  }
}
export async function validateAndResetPassword (
    passwordService: PasswordService,
    user: PasswordReset,
    confirmPassword: string,
    r: ResourceService,
    showMessage: (msg: string, field?: string) => void,
    showError: (msg: string, field?: string) => void,
    hideMessage: (field?: string) => void,
    validate: (u: PasswordReset, c: string, r2: ResourceService, showE: (msg: string, field?: string) => void, re?: RegExp) => boolean,
    handleError: (err: any) => void,
    reg?: RegExp,
    loading?: LoadingService) {
  if (!validate(user, confirmPassword, r, showError, reg)) {
    return;
  } else {
    hideMessage();
  }
  resetPassword(passwordService, user, r, showMessage, showError, handleError, loading);
}

export function validateChange(user: PasswordChange, confirmPassword: string, r: ResourceService, showError: (msg: string, field?: string) => void, reg?: RegExp): boolean {
  if (isEmpty(user.username)) {
    const msg = r.format(r.value('error_required'), r.value('username'));
    showError(msg, 'username');
    return false;
  } else if (isEmpty(user.password)) {
    const msg = r.format(r.value('error_required'), r.value('new_password'));
    showError(msg, 'password');
    return false;
  }
  if (reg && !reg.test(user.password)) {
    const msg = r.format(r.value('error_password_exp'), r.value('new_password'));
    showError(msg, 'password');
    return false;
  }
  if (isEmpty(user.currentPassword)) {
    const msg = r.format(r.value('error_required'), r.value('current_password'));
    showError(msg, 'current_password');
    return false;
  }
  if (user.step && user.step >= 1 && isEmpty(user.passcode)) {
    const msg = r.format(r.value('error_required'), r.value('passcode'));
    showError(msg, 'passcode');
    return false;
  }
  if (user.password !== confirmPassword) {
    const msg = r.value('error_confirm_password');
    showError(msg, 'confirmPassword');
    return false;
  }
  return true;
}
export async function changePassword (
    passwordService: PasswordService,
    user: PasswordChange, r: ResourceService,
    showMessage: (msg: string, field?: string) => void,
    showError: (msg: string, field?: string) => void,
    handleError: (err: any) => void,
    loading?: LoadingService) {
  try {
    if (loading) {
      loading.showLoading();
    }
    const result = await passwordService.changePassword(user);
    if (result === 2) {
      const msg = r.value('success_send_passcode_change_password');
      showMessage(msg);
      user.step = 1;
    } else if (result === true || result === 1) {
      const msg = r.value('success_change_password');
      showMessage(msg);
    } else {
      const msg = r.value('fail_change_password');
      showError(msg);
    }
  } catch (err) {
    handleError(err);
  }
  finally {
    if (loading) {
      loading.hideLoading();
    }
  }
}
export async function validateAndChangePassword (
    passwordService: PasswordService,
    user: PasswordChange,
    confirmPassword: string,
    r: ResourceService,
    showMessage: (msg: string, field?: string) => void,
    showError: (msg: string, field?: string) => void,
    hideMessage: (field?: string) => void,
    validate: (u: PasswordChange, c: string, r2: ResourceService, showE: (msg: string, field?: string) => void, re?: RegExp) => boolean,
    handleError: (err: any) => void,
    reg?: RegExp,
    loading?: LoadingService) {
  if (!validate(user, confirmPassword, r, showError, reg)) {
    return;
  } else {
    hideMessage();
  }
  changePassword(passwordService, user, r, showMessage, showError, handleError, loading);
}
