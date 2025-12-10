/*
 * Request Handlers
 * FORCE UPDATE VERSION 8
 */

function handleGetPersonnel(payload) {
    var data = getPersonnelData();
    // Filter sensitive data if needed (e.g. remove password hash)
    var safeData = data.map(function (u) {
        return {
            Name: u.Name,
            Account: u.Account,
            Role: u.Role,
            Email: u.Email,
            UUID: u.UUID,
            Title: u.Title,
            Department: u.Department,
            IsActive: u.IsActive
        };
    });
    return { status: 'success', data: safeData };
}

function handleGetStatusBoard() {
    var ss = getMainDb();
    var sheet = ss.getSheetByName('CurrentStatus');
    if (!sheet) return { status: 'success', data: [] };

    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var list = [];
    for (var i = 1; i < data.length; i++) {
        var item = {};
        for (var j = 0; j < headers.length; j++) {
            item[headers[j]] = data[i][j];
        }
        list.push(item);
    }
    return { status: 'success', data: list };
}

function handleCheckInOut(payload, user) {
    // Payload: { status, location, note, coords }
    var record = {
        userName: user.account, // or user.name
        status: payload.status,
        deviceUuid: payload.uuid || 'unknown', // should verify with DeviceMapping
        sessionId: payload.sessionId, // redundancy
        location: payload.location,
        note: payload.note,
        isRemote: true // logic to determine if remote
    };

    appendAttendanceLog(record);
    return { status: 'success', message: 'Checked in as ' + payload.status };
}

// ... Additional handlers for updates/deletes would go here
function handleUpdatePersonnel(payload, user) {
    // payload: { isNew: boolean, data: object }
    // data: { Name, Account, Role, ... }

    // Simple validation
    if (!payload.data || !payload.data.Account) {
        throw new Error('Missing account information');
    }

    if (payload.isNew) {
        // Add Mode
        // Set default password if not provided
        if (!payload.data.Password) {
            payload.data.Password = '123456';
        }

        // Hash password before saving
        var rawPass = payload.data.Password;
        logSystemEvent('INFO', 'PRE_HASH', 'Raw: ' + rawPass, user.account);
        payload.data.Password = computeHash(rawPass);
        logSystemEvent('INFO', 'POST_HASH', 'Hashed: ' + payload.data.Password, user.account);

        // Force IsActive true for new
        payload.data.IsActive = true;

        addPersonnel(payload.data);
        logSystemEvent('INFO', 'Personnel', 'User added: ' + payload.data.Account, user.account);
        return { status: 'success', message: 'User added successfully' };
    } else {
        // Edit Mode
        // Prevent editing own role/account easily via this if needed, but for now allow Admin full control
        // If password is blank/empty, remove it from updates so we don't overwrite with empty
        if (!payload.data.Password) {
            delete payload.data.Password;
        } else {
            // If password is being updated, hash it
            logSystemEvent('INFO', 'PRE_HASH_EDIT', 'Raw: ' + payload.data.Password, user.account);
            payload.data.Password = computeHash(payload.data.Password);
            logSystemEvent('INFO', 'POST_HASH_EDIT', 'Hashed: ' + payload.data.Password, user.account);
        }

        editPersonnel(payload.data.Account, payload.data);
        logSystemEvent('INFO', 'Personnel', 'User updated: ' + payload.data.Account, user.account);
        return { status: 'success', message: 'User updated successfully' };
    }
}

function handleDeletePersonnel(payload, user) {
    // payload: { account: string }
    if (!payload.account) throw new Error('Target account required');
    if (payload.account === 'admin') throw new Error('Cannot delete super admin');

    deletePersonnel(payload.account);
    logSystemEvent('WARNING', 'Personnel', 'User deleted: ' + payload.account, user.account);
    return { status: 'success', message: 'User deleted successfully' };
}

function handleGetConfig(user) {
    return {
        status: 'success',
        data: {
            time: new Date().toISOString(),
            // Kiosk specific configs
        }
    };
}
