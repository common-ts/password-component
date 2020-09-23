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
interface ErrorMessage {
  field: string;
  code: string;
  param?: string|number|Date;
  message?: string;
}

export interface HttpRequest {
  get<T>(url: string, options?: { headers?: Headers; }): Promise<T>;
  delete<T>(url: string, options?: { headers?: Headers; }): Promise<T>;
  post<T>(url: string, obj: any, options?: { headers?: Headers; }): Promise<T>;
  put<T>(url: string, obj: any, options?: { headers?: Headers; }): Promise<T>;
  patch<T>(url: string, obj: any, options?: { headers?: Headers; }): Promise<T>;
}

export class PasswordWebClient implements PasswordService {
  constructor(protected http: HttpRequest, protected url: string) {
    this.forgotPassword = this.forgotPassword.bind(this);
    this.resetPassword = this.resetPassword.bind(this);
    this.changePassword = this.changePassword.bind(this);
  }
  forgotPassword(contact: string): Promise<boolean> {
    const url = this.url + '/forgot/' + contact;
    return this.http.get<boolean>(url);
  }
  resetPassword(password: PasswordReset): Promise<boolean|number> {
    const url = this.url + '/reset';
    return this.http.post<boolean>(url, password);
  }
  changePassword(pass: PasswordChange): Promise<boolean|number> {
    const url = this.url + '/change';
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

export function createError(code: string, field: string, message: string): ErrorMessage {
  return { code, field, message };
}
export function validateContact(contact: string, key: string, r: ResourceService, reg?: RegExp, showError?: (msg: string, field?: string) => void): boolean|ErrorMessage[] {
  if (showError) {
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
  } else {
    const errs: ErrorMessage[] = [];
    if (isEmpty(contact)) {
      const msg = r.format(r.value('error_required'), r.value(key));
      const e = createError('required', 'contact', msg);
      errs.push(e);
    }
    if (reg && !reg.test(contact)) {
      const msg = r.value('error_contact_exp');
      const e = createError('exp', 'contact', msg);
      errs.push(e);
    }
    return errs;
  }
}
export async function forgotPassword (
    forgot: (contact: string) => Promise<boolean>,
    contact: string, r: ResourceService,
    showMessage: (msg: string, field?: string) => void,
    showError: (msg: string, field?: string) => void,
    handleError: (err: any) => void,
    loading?: LoadingService) {
  try {
    if (loading) {
      loading.showLoading();
    }
    const result = await forgot(contact);
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
    forgot: (contact: string) => Promise<boolean>,
    contact: string,
    key: string,
    r: ResourceService,
    showMessage: (msg: string, field?: string) => void,
    showError: (msg: string, field?: string) => void,
    hideMessage: (field?: string) => void,
    validateC: (u: string, k: string, r2: ResourceService, re?: RegExp, showE2?: (msg: string, field?: string) => void) => boolean|ErrorMessage[],
    handleError: (err: any) => void,
    reg?: RegExp,
    loading?: LoadingService,
    showCustomError?: (msg: string|ErrorMessage[]) => void) {
  const s = (showCustomError ? null : showError);
  const results = validateC(contact, key, r, reg, s);
  if (results === false) {
    return;
  } else if (Array.isArray(results) && results.length > 0){
    if (showCustomError) {
      showCustomError(results);
    }
    return;
  } else {
    hideMessage();
  }
  forgotPassword(forgot, contact, r, showMessage, showError, handleError, loading);
}

export function validateReset(user: PasswordReset, confirmPassword: string, r: ResourceService, reg?: RegExp, showError?: (msg: string, field?: string) => void): boolean|ErrorMessage[] {
  if (showError) {
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
  } else {
    const errs: ErrorMessage[] = [];
    if (isEmpty(user.username)) {
      const msg = r.format(r.value('error_required'), r.value('username'));
      const e = createError('required', 'username', msg);
      errs.push(e);
    }
    if (isEmpty(user.passcode)) {
      const msg = r.format(r.value('error_required'), r.value('passcode'));
      const e = createError('required', 'passcode', msg);
      errs.push(e);
    }
    if (isEmpty(user.password)) {
      const msg = r.format(r.value('error_required'), r.value('new_password'));
      const e = createError('required', 'password', msg);
      errs.push(e);
    }
    if (reg && !reg.test(user.password)) {
      const msg = r.format(r.value('error_password_exp'), r.value('new_password'));
      const e = createError('exp', 'password', msg);
      errs.push(e);
    }
    if (user.password !== confirmPassword) {
      const msg = r.value('error_confirm_password');
      const e = createError('eq', 'confirmPassword', msg);
      e.param = 'password';
      errs.push(e);
    }
    return errs;
  }
}
export async function resetPassword (
    reset: (pass: PasswordReset) => Promise<boolean|number>,
    user: PasswordReset, r: ResourceService,
    showMessage: (msg: string, field?: string) => void,
    showError: (msg: string, field?: string) => void,
    handleError: (err: any) => void,
    loading?: LoadingService) {
  try {
    if (loading) {
      loading.showLoading();
    }
    const success = await reset(user);
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
    reset: (pass: PasswordReset) => Promise<boolean|number>,
    user: PasswordReset,
    confirmPassword: string,
    r: ResourceService,
    showMessage: (msg: string, field?: string) => void,
    showError: (msg: string, field?: string) => void,
    hideMessage: (field?: string) => void,
    validate: (u: PasswordReset, c: string, r2: ResourceService, re?: RegExp, showE?: (msg: string, field?: string) => void) => boolean|ErrorMessage[],
    handleError: (err: any) => void,
    reg?: RegExp,
    loading?: LoadingService,
    showCustomError?: (msg: string|ErrorMessage[]) => void) {
  const s = (showCustomError ? null : showError);
  const results = validate(user, confirmPassword, r, reg, s);
  if (results === false) {
    return;
  } else if (Array.isArray(results) && results.length > 0) {
    if (showCustomError) {
      showCustomError(results);
    }
    return;
  } else {
    hideMessage();
  }
  resetPassword(reset, user, r, showMessage, showError, handleError, loading);
}

export function validateChange(user: PasswordChange, confirmPassword: string, r: ResourceService, reg?: RegExp, showError?: (msg: string, field?: string) => void): boolean|ErrorMessage[] {
  if (showError) {
    if (isEmpty(user.username)) {
      const msg = r.format(r.value('error_required'), r.value('username'));
      showError(msg, 'username');
      return false;
    }
    if (isEmpty(user.password)) {
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
      showError(msg, 'currentPassword');
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
  } else {
    const errs: ErrorMessage[] = [];
    if (isEmpty(user.username)) {
      const msg = r.format(r.value('error_required'), r.value('username'));
      const e = createError('required', 'username', msg);
      errs.push(e);
    }
    if (isEmpty(user.password)) {
      const msg = r.format(r.value('error_required'), r.value('new_password'));
      const e = createError('required', 'password', msg);
      errs.push(e);
    }
    if (reg && !reg.test(user.password)) {
      const msg = r.format(r.value('error_password_exp'), r.value('new_password'));
      const e = createError('exp', 'password', msg);
      errs.push(e);
    }
    if (isEmpty(user.currentPassword)) {
      const msg = r.format(r.value('error_required'), r.value('current_password'));
      const e = createError('required', 'currentPassword', msg);
      errs.push(e);
    }
    if (user.step && user.step >= 1 && isEmpty(user.passcode)) {
      const msg = r.format(r.value('error_required'), r.value('passcode'));
      const e = createError('required', 'passcode', msg);
      errs.push(e);
    }
    if (user.password !== confirmPassword) {
      const msg = r.value('error_confirm_password');
      const e = createError('eq', 'confirmPassword', msg);
      e.param = 'password';
      errs.push(e);
    }
    return errs;
  }
}
export async function changePassword (
    change: (pass: PasswordChange) => Promise<boolean|number>,
    user: PasswordChange, r: ResourceService,
    showMessage: (msg: string, field?: string) => void,
    showError: (msg: string, field?: string) => void,
    handleError: (err: any) => void,
    loading?: LoadingService) {
  try {
    if (loading) {
      loading.showLoading();
    }
    const result = await change(user);
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
    change: (pass: PasswordChange) => Promise<boolean|number>,
    user: PasswordChange,
    confirmPassword: string,
    r: ResourceService,
    showMessage: (msg: string, field?: string) => void,
    showError: (msg: string, field?: string) => void,
    hideMessage: (field?: string) => void,
    validate: (u: PasswordChange, c: string, r2: ResourceService, re?: RegExp, showE?: (msg: string, field?: string) => void) => boolean|ErrorMessage[],
    handleError: (err: any) => void,
    reg?: RegExp,
    loading?: LoadingService,
    showCustomError?: (msg: string|ErrorMessage[]) => void) {
  const s = (showCustomError ? null : showError);
  const results = validate(user, confirmPassword, r, reg, s);
  if (results === false) {
    return;
  } else if (Array.isArray(results) && results.length > 0){
    if (showCustomError) {
      showCustomError(results);
    }
    return;
  } else {
    hideMessage();
  }
  changePassword(change, user, r, showMessage, showError, handleError, loading);
}
