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
            IsActive: u.IsActive,
            ShowOnBoard: u.ShowOnBoard
        };
    });
    return { status: 'success', data: safeData };
}

function handleGetStatusBoard() {
    var ss = getMainDb();

    // Debug: Log DB ID to SystemLog (One time checking)
    // logSystemEvent('DEBUG', 'DB_CHECK', 'Using DB: ' + ss.getId(), 'system');

    // 1. Get All Personnel who should be shown
    var peopleData = getPersonnelData(); // Returns array of objects

    // Debug: Log first person data (optional)
    // if (peopleData.length > 0) {
    //    logSystemEvent('DEBUG', 'DATA_CHECK', 'P1: ' + peopleData[0].Name + ', Show: ' + peopleData[0].ShowOnBoard, 'system');
    // }

    var visiblePeople = peopleData.filter(function (p) {
        // Handles "true", true, "TRUE"
        var val = String(p.ShowOnBoard).toLowerCase();
        return val === 'true';
    });

    // 2. Get Current Statuses
    var sheet = ss.getSheetByName('CurrentStatus');
    var statusMap = {};
    if (sheet) {
        var data = sheet.getDataRange().getValues();
        var headers = data[0];
        // data[i][0] is UserName
        // Headers: UserName, Status, LastUpdate, Location, Note
        for (var i = 1; i < data.length; i++) {
            var row = data[i];
            statusMap[row[0]] = {
                status: row[1],
                lastUpdate: row[2],
                location: row[3],
                note: row[4]
            };
        }
    }

    // 3. Merge
    var list = visiblePeople.map(function (person) {
        var st = statusMap[person.Account] || {}; // Match by Account/Name?
        // Note: updateCurrentStatus writes 'userName' which is user.account.
        // So we match person.Account

        // Return simplified object for Board
        return {
            name: person.Name,
            status: st.status || '', // Empty if no record
            location: st.location || '',
            note: st.note || '',
            lastUpdate: st.lastUpdate || ''
        };
    });

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

function handleBindDevice(payload) {
    // payload: { account, uuid }
    if (!payload.account || !payload.uuid) {
        throw new Error('Missing account or UUID');
    }

    var users = getPersonnelData();
    var target = users.find(function (u) { return u.Account === payload.account; });

    if (!target) {
        throw new Error('User not found: ' + payload.account);
    }

    // Update UUID
    // We reuse editPersonnel. It merges data.
    var updateData = {
        UUID: payload.uuid
    };

    editPersonnel(payload.account, updateData);
    logSystemEvent('INFO', 'DEVICE', 'Device Bound: ' + payload.uuid, payload.account);

    return { status: 'success', message: 'Device bound successfully' };
}

function handleLoginByDevice(payload) {
    if (!payload.uuid) return { status: 'error', message: 'Missing UUID' };

    var result = loginUserByDevice(payload.uuid); // in auth.js
    if (result) {
        return {
            status: 'success',
            data: {
                token: result.token,
                user: result.user
            }
        };
    } else {
        return { status: 'error', message: 'Device not bound or User inactive' };
    }
}

// Kiosk & QR Login Handlers


function checkKioskPermission(uuid) {
    if (!uuid) return null;
    var devices = getKioskDevicesData();
    // Return device object if found, else null
    return devices.find(function (d) { return d.UUID === uuid; });
}

function handleCheckKioskPermission(payload) {
    var device = checkKioskPermission(payload.uuid);
    return {
        status: 'success',
        data: {
            isKiosk: !!device,
            device: device ? { name: device.Name } : null
        }
    };
}

function handleInitQRSession(payload) {
    var sessionId = initQRSession(payload.uuid); // in auth.js
    return { status: 'success', data: { sessionId: sessionId } };
}

function handlePollQRSession(payload) {
    var result = pollQRSession(payload.sessionId); // in auth.js
    return { status: 'success', data: result };
}

function handleApproveQRSession(payload, user) {
    // payload: { sessionId }
    return approveQRSession(payload.sessionId, user); // in auth.js
}

// Kiosk Device CRUD (Admin)

function handleGetKioskDevices() {
    var list = getKioskDevicesData();
    return { status: 'success', data: list };
}

function handleAddKioskDevice(payload, user) {
    // Frontend sends { uuid, name, description } (lowercase)
    // DB expects { UUID, Name, Description } (Capitalized)
    const deviceData = {
        UUID: payload.uuid,
        Name: payload.name,
        Description: payload.description || '',
        AddedBy: user.account
    };
    addKioskDevice(deviceData);
    logSystemEvent('INFO', 'KIOSK', 'Device Added: ' + deviceData.Name, user.account);
    return { status: 'success', message: 'Device added' };
}

function handleDeleteKioskDevice(payload, user) {
    deleteKioskDevice(payload.uuid);
    logSystemEvent('WARNING', 'KIOSK', 'Device Deleted: ' + payload.uuid, user.account);
    return { status: 'success', message: 'Device deleted' };
}
