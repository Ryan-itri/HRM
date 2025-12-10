/*
 * 派外單位人員管理系統 - Backend Core
 * Version: 4.0
 */

function doGet(e) {
  // 返回前端頁面
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('派外單位人員管理系統')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  var output = { status: 'error', message: 'Unknown request' };

  try {
    var textParams = e.postData.contents;
    var params = JSON.parse(textParams);
    var action = params.action;
    var payload = params.payload;
    var sessionId = params.sessionId;

    // Auth Check (Except login/check_session)
    var user = null;
    // Auth Check (Except login/check_session/bind_device)
    var user = null;
    if (action !== 'login' && action !== 'bind_device') {
      user = verifySession(sessionId); // Implemented in auth.js
    }

    // Role-Based Access Control logic will be inside specific handlers or here

    switch (action) {
      case 'login':
        output = handleLogin(payload);
        break;
      case 'get_config':
        output = handleGetConfig(user);
        break;
      case 'get_personnel':
        checkRole(user, ['admin']);
        output = handleGetPersonnel(payload);
        break;
      case 'update_personnel':
        checkRole(user, ['admin']);
        output = handleUpdatePersonnel(payload, user);
        break;
      case 'delete_personnel':
        checkRole(user, ['admin']);
        output = handleDeletePersonnel(payload, user);
        break;
      case 'get_logs':
        checkRole(user, ['admin', 'supervisor']);
        output = handleGetLogs(payload);
        break;
      case 'check_in_out':
        // user verified via session
        output = handleCheckInOut(payload, user);
        break;
      case 'get_status_board':
        // Public or Staff
        output = handleGetStatusBoard();
        break;
      case 'bind_device':
        output = handleBindDevice(payload);
        break;
      default:
        output.message = 'Invalid Action: ' + action;
    }

  } catch (error) {
    output.status = 'error';
    output.message = error.toString();
    logSystemEvent('ERROR', 'API', error.toString(), user ? user.account : 'System');
  }

  return ContentService.createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}

function checkRole(user, allowedRoles) {
  if (!user || allowedRoles.indexOf(user.role) === -1) {
    var role = user ? user.role : 'NoUser';
    throw new Error('Permission Denied (Current Role: ' + role + ')');
  }
}
