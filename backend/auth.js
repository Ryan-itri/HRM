/*
 * Authentication & Session Management
 */

function handleLogin(payload) {
    var account = payload.account;
    var rawPassword = payload.password;

    if (!account || !rawPassword) {
        throw new Error('Missing credentials');
    }

    var users = getPersonnelData(); // From db.js
    var targetUser = users.find(function (u) { return u.Account === account; });

    if (!targetUser) {
        // Prevent info leak, generic error?
        // SRS doesn't specify, but for debugging V4 we usually say 'User not found' or 'Auth failed'
        throw new Error('Authentication failed');
    }

    // Admin Init Password Logic (from SRS modification)
    // - 如果admin權限在資料庫的密碼欄位設定為admin
    // - 則admin帳號登入的密碼則改為admin (input password check 'admin')
    // - 登入後在將密碼改為加密後之字串

    var storedPassword = targetUser.Password;
    var loginSuccess = false;

    // Init Admin check
    if (targetUser.Role === 'admin' && storedPassword === 'admin') {
        if (rawPassword === 'admin') {
            loginSuccess = true;
            // Auto update password to hashed 'admin'
            var hashedAdmin = computeHash('admin');
            updateUserPassword(targetUser.Account, hashedAdmin);
        }
    } else {
        // Normal hash check
        var hashedInput = computeHash(rawPassword);
        if (hashedInput === storedPassword) {
            loginSuccess = true;
        }
    }

    if (!loginSuccess) {
        throw new Error('Authentication failed');
    }

    // Create Session
    var sessionToken = generateSessionToken();

    // Normalize user object for session to match API response and RBAC expectations
    var sessionUser = {
        name: targetUser.Name,
        role: targetUser.Role,
        account: targetUser.Account
    };

    cacheSession(sessionToken, sessionUser);

    logSystemEvent('INFO', 'AUTH', 'User Login Success', targetUser.Account);

    return {
        status: 'success',
        data: {
            token: sessionToken,
            user: sessionUser
        }
    };
}

function verifySession(token) {
    if (!token) throw new Error('No session provided');
    var user = getSessionFromCache(token);
    if (!user) {
        throw new Error('Session expired or invalid');
    }
    return user;
}

function computeHash(input) {
    var rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, input);
    var txtHash = '';
    for (var i = 0; i < rawHash.length; i++) {
        var hashVal = rawHash[i];
        if (hashVal < 0) {
            hashVal += 256;
        }
        if (hashVal.toString(16).length == 1) {
            txtHash += '0';
        }
        txtHash += hashVal.toString(16);
    }
    return txtHash;
}

// Simple Cache
function cacheSession(token, user) {
    var cache = CacheService.getScriptCache();
    cache.put(token, JSON.stringify(user), 21600); // 6 hours
}

function getSessionFromCache(token) {
    var cache = CacheService.getScriptCache();
    var json = cache.get(token);
    if (json) {
        return JSON.parse(json);
    }
    return null;
}

function generateSessionToken() {
    return Utilities.getUuid();
}

function loginUserByDevice(uuid) {
    if (!uuid) return null;
    var users = getPersonnelData(); // db.js
    var user = users.find(function (u) { return u.UUID === uuid; });

    if (user && user.IsActive) {
        var token = generateSessionToken();
        var sessionUser = {
            account: user.Account,
            name: user.Name,
            role: user.Role,
            department: user.Department
        };
        cacheSession(token, sessionUser);
        return {
            token: token,
            user: sessionUser
        };
    }
    return null;
}

// QR Code Session Logic (Kiosk)

function initQRSession(deviceUuid) {
    // 1. Verify Device is Kiosk (Whitelist Check)
    var device = checkKioskPermission(deviceUuid);
    if (!device) {
        throw new Error('Device not authorized for Kiosk mode');
    }

    // 2. Generate Session ID
    var sessionId = Utilities.getUuid();

    // 3. Store in Cache (Status: PENDING) - TTL 2 mins (120s)
    var cache = CacheService.getScriptCache();
    var data = {
        status: 'PENDING',
        deviceUuid: deviceUuid,
        createdAt: new Date().getTime()
    };
    cache.put('QR_' + sessionId, JSON.stringify(data), 120);

    return sessionId;
}

function pollQRSession(sessionId) {
    var cache = CacheService.getScriptCache();
    var json = cache.get('QR_' + sessionId);

    if (!json) return { status: 'EXPIRED' };

    var data = JSON.parse(json);

    if (data.status === 'APPROVED') {
        // Generate real session token
        var finalToken = generateSessionToken();
        var sessionUser = data.user;

        // Cache the real session
        cacheSession(finalToken, sessionUser);

        // Remove QR session (One-time use)
        cache.remove('QR_' + sessionId);

        return {
            status: 'APPROVED',
            token: finalToken,
            user: sessionUser
        };
    }

    return { status: 'PENDING' };
}

function approveQRSession(sessionId, approvingUser) {
    var cache = CacheService.getScriptCache();
    var json = cache.get('QR_' + sessionId);

    if (!json) throw new Error('Invalid or Expired QR Session');

    var data = JSON.parse(json);
    if (data.status !== 'PENDING') throw new Error('Session already processed');

    // Update to APPROVED with User Info
    data.status = 'APPROVED';
    data.user = {
        name: approvingUser.name,
        role: approvingUser.role,
        account: approvingUser.account
    };

    cache.put('QR_' + sessionId, JSON.stringify(data), 120);

    return { status: 'success', message: 'Login Approved' };
}

