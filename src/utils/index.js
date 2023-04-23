import {utils, write} from "xlsx";

export const downloadFile = (blob, extension) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `${Date.now()}.${extension}`);
    document.body.append(a);
    a.click();
    setTimeout(() => {
        a.remove();
    }, 0);
}

export const makeExcelFileByData = (wsData) => {
    const wb = utils.book_new();
    const ws = utils.aoa_to_sheet(wsData);

    wb.Props = {
        Title: 'FileFormat',
        Subject: 'Developer Guide',
    };
    wb.SheetNames.push('Test Sheet');
    wb.Sheets['Test Sheet'] = ws;

    const wsCols = [
        {wch: 50},
        {wch: 50},
    ];
    ws['!cols'] = wsCols;

    const wbout = write(wb, {bookType: 'xlsx', type: 'buffer'});

    return new Blob([wbout], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
}