/*
 * Database Layer
 */

function getMainDb() {
    // Use bound spreadsheet or search by name
    // Assuming this script is bound to valid container or standalone
    // For V4, typically we search for "AGY_派外管理_DB"
    var files = DriveApp.getFilesByName("AGY_派外管理_DB");
    if (files.hasNext()) return SpreadsheetApp.open(files.next());
    // Fallback: create if not exists (for demo)
    return SpreadsheetApp.create("AGY_派外管理_DB");
}

function getYearlyDb(type, year) {
    var dbName = (type === 'Event' ? 'EventDB_' : 'LogDB_') + year;
    var files = DriveApp.getFilesByName(dbName);
    if (files.hasNext()) return SpreadsheetApp.open(files.next());

    // Auto Create
    var ss = SpreadsheetApp.create(dbName);
    // Init Headers
    if (type === 'Event') {
        ss.getSheets()[0].setName('SystemLog');
        ss.getSheets()[0].appendRow(['Timestamp', 'Level', 'Category', 'Message', 'User', 'Details']);
    } else {
        ss.getSheets()[0].setName('AttendanceLog');
        ss.getSheets()[0].appendRow(['Timestamp', 'UserName', 'Status', 'DeviceUUID', 'SessionID', 'Location', 'Note', 'IsRemote']);
    }
    return ss;
}

// ... (Existing code)

function getPersonnelData() {
    var ss = getMainDb();
    var sheet = ss.getSheetByName('Personnel');
    if (!sheet) {
        sheet = ss.insertSheet('Personnel');
        // Added ShowOnBoard
        sheet.appendRow(['Name', 'Account', 'Password', 'Role', 'Email', 'UUID', 'Title', 'Department', 'IsActive', 'ShowOnBoard']);
        // Seed Admin
        sheet.appendRow(['Admin', 'admin', 'admin', 'admin', 'admin@example.com', '', 'SysAdmin', 'IT', true, false]);
    } else {
        // Schema Migration / Verification
        // Check if ShowOnBoard header exists
        var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        var hasShowOnBoard = headers.indexOf('ShowOnBoard') > -1;

        if (!hasShowOnBoard) {
            // Append header
            var newCol = headers.length + 1;
            sheet.getRange(1, newCol).setValue('ShowOnBoard');
            // Optional: Default existing rows to TRUE or FALSE?
            // SRS says default is TRUE (implied by previous requests? User said toggle check).
            // PersonnelForm defaults to TRUE.
            // Let's set existing rows to TRUE.
            var lastRow = sheet.getLastRow();
            if (lastRow > 1) {
                // Set column values for 2..lastRow
                sheet.getRange(2, newCol, lastRow - 1, 1).setValue(true);
            }
        }
    }
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var results = [];
    for (var i = 1; i < data.length; i++) {
        var row = data[i];
        var obj = {};
        for (var j = 0; j < headers.length; j++) {
            obj[headers[j]] = row[j];
        }
        results.push(obj);
    }
    return results;
}

// ...

function addPersonnel(data) {
    var ss = getMainDb();
    var sheet = ss.getSheetByName('Personnel');
    var rows = sheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
        if (rows[i][1] === data.Account) {
            throw new Error('Account already exists');
        }
    }

    // ['Name', 'Account', 'Password', 'Role', 'Email', 'UUID', 'Title', 'Department', 'IsActive', 'ShowOnBoard']
    sheet.appendRow([
        data.Name,
        data.Account,
        data.Password,
        data.Role,
        data.Email,
        data.UUID || '',
        data.Title,
        data.Department,
        data.IsActive,
        data.ShowOnBoard // boolean or string
    ]);
}

// ... 

function resetDailyStatus() {
    // 每天清晨AM05:00將所有狀態清除成空白
    // Clears CurrentStatus sheet content but keeps headers
    var ss = getMainDb();
    var sheet = ss.getSheetByName('CurrentStatus');
    if (sheet) {
        var lastRow = sheet.getLastRow();
        if (lastRow > 1) {
            // Headers are Row 1. Clear content from Row 2 down.
            // Columns: UserName, Status, LastUpdate, Location, Note
            // Actually, the user requirement is "Clear Status". 
            // Should we delete rows? Or update Status to empty?
            // "將所有狀態清除成空白" -> Implies setting Status/Location/Note to empty string.

            // Option A: Log deletion event and Clear Sheet.
            // Option B: Update all rows to Status='', Location='', Note=''.

            // If we clear the sheet, then handleGetStatusBoard will return empty list.
            // But handleGetStatusBoard will be updated to join Personnel list.
            // So if CurrentStatus is empty, everyone shows as "Unknown/Empty", which is correct for "Reset".

            // So safest is to clear the sheet content.
            sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
        }
    }
    console.log('Daily Status Reset Complete');
}


function updateUserPassword(account, newHash) {
    var ss = getMainDb();
    var sheet = ss.getSheetByName('Personnel');
    var data = sheet.getDataRange().getValues();
    // Col 2 is Account (index 1), Col 3 is Password (index 2)
    // Headers: ['Name', 'Account', 'Password', 'Role', 'Email', 'UUID', 'Title', 'Department', 'IsActive']
    for (var i = 1; i < data.length; i++) {
        if (data[i][1] === account) {
            sheet.getRange(i + 1, 3).setValue(newHash);
            return;
        }
    }
}

function addPersonnel(data) {
    var ss = getMainDb();
    var sheet = ss.getSheetByName('Personnel');
    // Ensure uniqueness of account
    var rows = sheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
        if (rows[i][1] === data.Account) {
            throw new Error('Account already exists');
        }
    }

    // ['Name', 'Account', 'Password', 'Role', 'Email', 'UUID', 'Title', 'Department', 'IsActive', 'ShowOnBoard']
    sheet.appendRow([
        data.Name,
        data.Account,
        data.Password, // Should be hashed usually, or initial default
        data.Role,
        data.Email,
        data.UUID || '',
        data.Title,
        data.Department,
        data.IsActive,
        data.ShowOnBoard
    ]);
}

function editPersonnel(account, updates) {
    var ss = getMainDb();
    var sheet = ss.getSheetByName('Personnel');
    var data = sheet.getDataRange().getValues();
    var headers = data[0];

    for (var i = 1; i < data.length; i++) {
        if (data[i][1] === account) {
            // Found user
            var rowIdx = i + 1;
            // Iterate updates keys
            for (var key in updates) {
                var colIdx = headers.indexOf(key);
                if (colIdx > -1) {
                    // Update specific cell (colIdx + 1 because 1-based)
                    sheet.getRange(rowIdx, colIdx + 1).setValue(updates[key]);
                }
            }
            return true;
        }
    }
    throw new Error('User not found: ' + account);
}

function deletePersonnel(account) {
    var ss = getMainDb();
    var sheet = ss.getSheetByName('Personnel');
    var data = sheet.getDataRange().getValues();

    for (var i = 1; i < data.length; i++) {
        if (data[i][1] === account) {
            sheet.deleteRow(i + 1);
            return true;
        }
    }
    throw new Error('User not found: ' + account);
}

function logSystemEvent(level, category, message, socketUser) {
    var year = new Date().getFullYear();
    var ss = getYearlyDb('Event', year);
    var sheet = ss.getSheets()[0];
    sheet.appendRow([new Date(), level, category, message, socketUser, '']);
}

function appendAttendanceLog(record) {
    var year = new Date().getFullYear();
    var ss = getYearlyDb('Log', year);
    var sheet = ss.getSheets()[0];
    // ['Timestamp', 'UserName', 'Status', 'DeviceUUID', 'SessionID', 'Location', 'Note', 'IsRemote']
    sheet.appendRow([
        new Date(),
        record.userName,
        record.status,
        record.deviceUuid,
        record.sessionId,
        record.location,
        record.note,
        record.isRemote
    ]);

    // Update CurrentStatus in MainDB
    updateCurrentStatus(record);
}

function updateCurrentStatus(record) {
    var ss = getMainDb();
    var sheet = ss.getSheetByName('CurrentStatus');
    if (!sheet) {
        sheet = ss.insertSheet('CurrentStatus');
        sheet.appendRow(['UserName', 'Status', 'LastUpdate', 'Location', 'Note']);
    }

    // Upsert
    var data = sheet.getDataRange().getValues();
    var found = false;
    for (var i = 1; i < data.length; i++) {
        if (data[i][0] === record.userName) {
            sheet.getRange(i + 1, 2, 1, 4).setValues([[
                record.status,
                new Date(),
                record.location,
                record.note
            ]]);
            found = true;
            break;
        }
    }
    if (!found) {
        sheet.appendRow([record.userName, record.status, new Date(), record.location, record.note]);
    }
}

function getKioskDevicesData() {
    var ss = getMainDb();
    var sheet = ss.getSheetByName('KioskDevices');
    if (!sheet) {
        sheet = ss.insertSheet('KioskDevices');
        sheet.appendRow(['UUID', 'Name', 'Description', 'AddedBy', 'CreatedAt']);
    }

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
    return list;
}

function addKioskDevice(data) {
    var ss = getMainDb();
    var sheet = ss.getSheetByName('KioskDevices');
    // Check dupe
    var rows = sheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
        if (rows[i][0] === data.UUID) {
            throw new Error('Device UUID already exists');
        }
    }

    sheet.appendRow([
        data.UUID,
        data.Name,
        data.Description,
        data.AddedBy,
        new Date()
    ]);
}

function deleteKioskDevice(uuid) {
    var ss = getMainDb();
    var sheet = ss.getSheetByName('KioskDevices');
    var rows = sheet.getDataRange().getValues();

    for (var i = 1; i < rows.length; i++) {
        if (rows[i][0] === uuid) {
            sheet.deleteRow(i + 1);
            return;
        }
    }
    throw new Error('Device not found');
}
