"use strict";
var __awaiter=(this && this.__awaiter) || function(thisArg, _arguments, P, generator){
  function adopt(value){ return value instanceof P ? value : new P(function(resolve){ resolve(value); }); }
  return new (P || (P=Promise))(function(resolve, reject){
    function fulfilled(value){ try { step(generator.next(value)); } catch (e){ reject(e); } }
    function rejected(value){ try { step(generator["throw"](value)); } catch (e){ reject(e); } }
    function step(result){ result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
    step((generator=generator.apply(thisArg, _arguments || [])).next());
  });
};
var __generator=(this && this.__generator) || function(thisArg, body){
  var _={ label: 0, sent: function(){ if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
  return g={ next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol==="function" && (g[Symbol.iterator]=function(){ return this; }), g;
  function verb(n){ return function(v){ return step([n, v]); }; }
  function step(op){
    if (f) throw new TypeError("Generator is already executing.");
    while (_) try {
      if (f=1, y && (t=op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t=y["return"]) && t.call(y), 0) : y.next) && !(t=t.call(y, op[1])).done) return t;
      if (y=0, t) op=[op[0] & 2, t.value];
      switch (op[0]){
        case 0: case 1: t=op; break;
        case 4: _.label++; return { value: op[1], done: false };
        case 5: _.label++; y=op[1]; op=[0]; continue;
        case 7: op=_.ops.pop(); _.trys.pop(); continue;
        default:
          if (!(t=_.trys, t=t.length > 0 && t[t.length - 1]) && (op[0]===6 || op[0]===2)){ _=0; continue; }
          if (op[0]===3 && (!t || (op[1] > t[0] && op[1] < t[3]))){ _.label=op[1]; break; }
          if (op[0]===6 && _.label < t[1]){ _.label=t[1]; t=op; break; }
          if (t && _.label < t[2]){ _.label=t[2]; _.ops.push(op); break; }
          if (t[2]) _.ops.pop();
          _.trys.pop(); continue;
      }
      op=body.call(thisArg, _);
    } catch (e){ op=[6, e]; y=0; } finally { f=t=0; }
    if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
  }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.simplePassword=/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
exports.mediumPassword=/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;
exports.strongPassword=/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
var PasswordWebClient=(function(){
  function PasswordWebClient(http, serviceUrl){
    this.http=http;
    this.serviceUrl=serviceUrl;
  }
  PasswordWebClient.prototype.forgotPassword=function(contact){
    var url=this.serviceUrl + '/forgot/' + contact;
    return this.http.get(url);
  };
  PasswordWebClient.prototype.resetPassword=function(password){
    var url=this.serviceUrl + '/reset';
    return this.http.post(url, password);
  };
  PasswordWebClient.prototype.changePassword=function(pass){
    var url=this.serviceUrl + '/change';
    return this.http.put(url, pass);
  };
  return PasswordWebClient;
}());
exports.PasswordWebClient=PasswordWebClient;
function isEmpty(str){
  return (!str || str==='');
}
exports.isEmpty=isEmpty;
function createError(code, field, message){
  return { code: code, field: field, message: message };
}
exports.createError=createError;
function validateContact(contact, key, r, showError, reg){
  if (showError){
    if (isEmpty(contact)){
      var msg=r.format(r.value('error_required'), r.value(key));
      showError(msg, 'contact');
      return false;
    }
    if (reg && !reg.test(contact)){
      var msg=r.value('error_contact_exp');
      showError(msg, 'contact');
      return false;
    }
    return true;
  }
  else {
    var errors=[];
    if (isEmpty(contact)){
      var msg=r.format(r.value('error_required'), r.value(key));
      var e=createError('required', 'contact', msg);
      errors.push(e);
    }
    if (reg && !reg.test(contact)){
      var msg=r.value('error_contact_exp');
      var e=createError('exp', 'contact', msg);
      errors.push(e);
    }
    return errors;
  }
}
exports.validateContact=validateContact;
function forgotPassword(passwordService, contact, r, showMessage, showError, handleError, loading){
  return __awaiter(this, void 0, void 0, function(){
    var result, msg, msg, err_1;
    return __generator(this, function(_a){
      switch (_a.label){
        case 0:
          _a.trys.push([0, 2, 3, 4]);
          if (loading){
            loading.showLoading();
          }
          return [4, passwordService.forgotPassword(contact)];
        case 1:
          result=_a.sent();
          if (result){
            msg=r.value('success_forgot_password');
            showMessage(msg, 'contact');
          }
          else {
            msg=r.value('fail_forgot_password');
            showError(msg, 'contact');
          }
          return [3, 4];
        case 2:
          err_1=_a.sent();
          handleError(err_1);
          return [3, 4];
        case 3:
          if (loading){
            loading.hideLoading();
          }
          return [7];
        case 4: return [2];
      }
    });
  });
}
exports.forgotPassword=forgotPassword;
function validateAndForgotPassword(passwordService, contact, key, r, showMessage, showError, hideMessage, validateC, handleError, reg, loading, showCustomError){
  return __awaiter(this, void 0, void 0, function(){
    var s, results;
    return __generator(this, function(_a){
      s=(showCustomError ? null : showError);
      results=validateC(contact, key, r, s, reg);
      if (results===false){
        return [2];
      }
      else if (Array.isArray(results) && results.length > 0){
        if (showCustomError){
          showCustomError(results);
        }
        return [2];
      }
      else {
        hideMessage();
      }
      forgotPassword(passwordService, contact, r, showMessage, showError, handleError, loading);
      return [2];
    });
  });
}
exports.validateAndForgotPassword=validateAndForgotPassword;
function validateReset(user, confirmPassword, r, showError, reg){
  if (showError){
    if (isEmpty(user.username)){
      var msg=r.format(r.value('error_required'), r.value('username'));
      showError(msg, 'username');
      return false;
    }
    else if (isEmpty(user.passcode)){
      var msg=r.format(r.value('error_required'), r.value('passcode'));
      showError(msg, 'passcode');
      return false;
    }
    else if (isEmpty(user.password)){
      var msg=r.format(r.value('error_required'), r.value('new_password'));
      showError(msg, 'password');
      return false;
    }
    if (reg && !reg.test(user.password)){
      var msg=r.format(r.value('error_password_exp'), r.value('new_password'));
      showError(msg, 'password');
      return false;
    }
    if (user.password !== confirmPassword){
      var msg=r.value('error_confirm_password');
      showError(msg, 'confirmPassword');
      return false;
    }
    return true;
  }
  else {
    var errors=[];
    if (isEmpty(user.username)){
      var msg=r.format(r.value('error_required'), r.value('username'));
      var e=createError('required', 'username', msg);
      errors.push(e);
    }
    if (isEmpty(user.passcode)){
      var msg=r.format(r.value('error_required'), r.value('passcode'));
      var e=createError('required', 'passcode', msg);
      errors.push(e);
    }
    if (isEmpty(user.password)){
      var msg=r.format(r.value('error_required'), r.value('new_password'));
      var e=createError('required', 'password', msg);
      errors.push(e);
    }
    if (reg && !reg.test(user.password)){
      var msg=r.format(r.value('error_password_exp'), r.value('new_password'));
      var e=createError('exp', 'password', msg);
      errors.push(e);
    }
    if (user.password !== confirmPassword){
      var msg=r.value('error_confirm_password');
      var e=createError('eq', 'confirmPassword', msg);
      e.param='password';
      errors.push(e);
    }
    return errors;
  }
}
exports.validateReset=validateReset;
function resetPassword(passwordService, user, r, showMessage, showError, handleError, loading){
  return __awaiter(this, void 0, void 0, function(){
    var success, msg, msg, err_2;
    return __generator(this, function(_a){
      switch (_a.label){
        case 0:
          _a.trys.push([0, 2, 3, 4]);
          if (loading){
            loading.showLoading();
          }
          return [4, passwordService.resetPassword(user)];
        case 1:
          success=_a.sent();
          if (success===true || success===1){
            msg=r.value('success_reset_password');
            showMessage(msg);
          }
          else {
            msg=r.value('fail_reset_password');
            showError(msg);
          }
          return [3, 4];
        case 2:
          err_2=_a.sent();
          handleError(err_2);
          return [3, 4];
        case 3:
          if (loading){
            loading.hideLoading();
          }
          return [7];
        case 4: return [2];
      }
    });
  });
}
exports.resetPassword=resetPassword;
function validateAndResetPassword(passwordService, user, confirmPassword, r, showMessage, showError, hideMessage, validate, handleError, reg, loading, showCustomError){
  return __awaiter(this, void 0, void 0, function(){
    var s, results;
    return __generator(this, function(_a){
      s=(showCustomError ? null : showError);
      results=validate(user, confirmPassword, r, s, reg);
      if (results===false){
        return [2];
      }
      else if (Array.isArray(results) && results.length > 0){
        if (showCustomError){
          showCustomError(results);
        }
        return [2];
      }
      else {
        hideMessage();
      }
      resetPassword(passwordService, user, r, showMessage, showError, handleError, loading);
      return [2];
    });
  });
}
exports.validateAndResetPassword=validateAndResetPassword;
function validateChange(user, confirmPassword, r, showError, reg){
  if (showError){
    if (isEmpty(user.username)){
      var msg=r.format(r.value('error_required'), r.value('username'));
      showError(msg, 'username');
      return false;
    }
    if (isEmpty(user.password)){
      var msg=r.format(r.value('error_required'), r.value('new_password'));
      showError(msg, 'password');
      return false;
    }
    if (reg && !reg.test(user.password)){
      var msg=r.format(r.value('error_password_exp'), r.value('new_password'));
      showError(msg, 'password');
      return false;
    }
    if (isEmpty(user.currentPassword)){
      var msg=r.format(r.value('error_required'), r.value('current_password'));
      showError(msg, 'currentPassword');
      return false;
    }
    if (user.step && user.step >= 1 && isEmpty(user.passcode)){
      var msg=r.format(r.value('error_required'), r.value('passcode'));
      showError(msg, 'passcode');
      return false;
    }
    if (user.password !== confirmPassword){
      var msg=r.value('error_confirm_password');
      showError(msg, 'confirmPassword');
      return false;
    }
    return true;
  }
  else {
    var errors=[];
    if (isEmpty(user.username)){
      var msg=r.format(r.value('error_required'), r.value('username'));
      var e=createError('required', 'username', msg);
      errors.push(e);
    }
    if (isEmpty(user.password)){
      var msg=r.format(r.value('error_required'), r.value('new_password'));
      var e=createError('required', 'password', msg);
      errors.push(e);
    }
    if (reg && !reg.test(user.password)){
      var msg=r.format(r.value('error_password_exp'), r.value('new_password'));
      var e=createError('exp', 'password', msg);
      errors.push(e);
    }
    if (isEmpty(user.currentPassword)){
      var msg=r.format(r.value('error_required'), r.value('current_password'));
      var e=createError('required', 'currentPassword', msg);
      errors.push(e);
    }
    if (user.step && user.step >= 1 && isEmpty(user.passcode)){
      var msg=r.format(r.value('error_required'), r.value('passcode'));
      var e=createError('required', 'passcode', msg);
      errors.push(e);
    }
    if (user.password !== confirmPassword){
      var msg=r.value('error_confirm_password');
      var e=createError('eq', 'confirmPassword', msg);
      e.param='password';
      errors.push(e);
    }
    return errors;
  }
}
exports.validateChange=validateChange;
function changePassword(passwordService, user, r, showMessage, showError, handleError, loading){
  return __awaiter(this, void 0, void 0, function(){
    var result, msg, msg, msg, err_3;
    return __generator(this, function(_a){
      switch (_a.label){
        case 0:
          _a.trys.push([0, 2, 3, 4]);
          if (loading){
            loading.showLoading();
          }
          return [4, passwordService.changePassword(user)];
        case 1:
          result=_a.sent();
          if (result===2){
            msg=r.value('success_send_passcode_change_password');
            showMessage(msg);
            user.step=1;
          }
          else if (result===true || result===1){
            msg=r.value('success_change_password');
            showMessage(msg);
          }
          else {
            msg=r.value('fail_change_password');
            showError(msg);
          }
          return [3, 4];
        case 2:
          err_3=_a.sent();
          handleError(err_3);
          return [3, 4];
        case 3:
          if (loading){
            loading.hideLoading();
          }
          return [7];
        case 4: return [2];
      }
    });
  });
}
exports.changePassword=changePassword;
function validateAndChangePassword(passwordService, user, confirmPassword, r, showMessage, showError, hideMessage, validate, handleError, reg, loading, showCustomError){
  return __awaiter(this, void 0, void 0, function(){
    var s, results;
    return __generator(this, function(_a){
      s=(showCustomError ? null : showError);
      results=validate(user, confirmPassword, r, s, reg);
      if (results===false){
        return [2];
      }
      else if (Array.isArray(results) && results.length > 0){
        if (showCustomError){
          showCustomError(results);
        }
        return [2];
      }
      else {
        hideMessage();
      }
      changePassword(passwordService, user, r, showMessage, showError, handleError, loading);
      return [2];
    });
  });
}
exports.validateAndChangePassword=validateAndChangePassword;
