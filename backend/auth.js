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
