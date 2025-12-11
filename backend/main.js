/*
 * 南區研發中心 人員出勤看板 - Backend Core
 * Version: 4.0
 */

function doGet(e) {
  // 返回前端頁面
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('南區研發中心 人員出勤看板')
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
    // Auth Check (Except login/check_session/bind_device/qr_flow)
    var user = null;
    var publicActions = ['login', 'bind_device', 'check_kiosk_permission', 'init_qr_session', 'poll_qr_status', 'login_by_device'];
    if (publicActions.indexOf(action) === -1) {
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
      case 'login_by_device':
        output = handleLoginByDevice(payload);
        break;
      // QR & Kiosk Logic
      case 'check_kiosk_permission':
        output = handleCheckKioskPermission(payload);
        break;
      case 'init_qr_session':
        output = handleInitQRSession(payload);
        break;
      case 'poll_qr_status':
        output = handlePollQRSession(payload);
        break;
      case 'approve_qr_session':
        // User verified
        output = handleApproveQRSession(payload, user);
        break;
      // Kiosk Admin
      case 'get_kiosk_devices':
        checkRole(user, ['admin']);
        output = handleGetKioskDevices();
        break;
      case 'add_kiosk_device':
        checkRole(user, ['admin']);
        output = handleAddKioskDevice(payload, user);
        break;
      case 'delete_kiosk_device':
        checkRole(user, ['admin']);
        output = handleDeleteKioskDevice(payload, user);
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
